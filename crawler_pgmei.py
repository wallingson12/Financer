from playwright.sync_api import sync_playwright
import csv
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

BASE = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app"
EMISSAO = f"{BASE}/emissao"

CNPJS = os.getenv("CNPJS", "").split(",")
CNPJS = [cnpj.strip() for cnpj in CNPJS if cnpj.strip()]

if not CNPJS:
    print("⚠️ Nenhum CNPJ encontrado no .env")
    exit()

ANOS = [str(ano) for ano in range(2023, 2026)]

alertas_capturados = []


def resetar_fluxo(page):
    try:
        print("🔄 Resetando fluxo...")

        # tenta fechar popup
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)

        # tenta clicar botão fechar se existir
        try:
            page.locator("button:has-text('Fechar')").click(timeout=2000)
        except:
            pass

        # volta pra página inicial
        page.goto(BASE, timeout=60000)
        page.wait_for_timeout(3000)

    except Exception as e:
        print(f"⚠️ Erro ao resetar: {e}")


def capturar_alerta(page, cnpj, ano):
    alertas = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cnpj": cnpj,
        "ano": ano,
        "mensagens": []
    }

    seletores = [
        "div[class*='alert']",
        "div[class*='warning']",
        "div[class*='error']",
        ".aviso",
        ".erro",
        ".mensagem"
    ]

    for seletor in seletores:
        try:
            elementos = page.locator(seletor)
            for i in range(elementos.count()):
                texto = elementos.nth(i).inner_text().strip()
                if texto and len(texto) > 5:
                    alertas["mensagens"].append({
                        "tipo": seletor,
                        "texto": texto
                    })
        except:
            pass

    if alertas["mensagens"]:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot = f"reports/alertas/alerta_{cnpj}_{ano}_{timestamp}.png"
        page.screenshot(path=screenshot)

        alertas["screenshot"] = screenshot
        alertas_capturados.append(alertas)

        return alertas

    return None


def colar_cnpj(page, locator, texto):
    locator.click()
    page.keyboard.press("Control+A")
    page.keyboard.press("Backspace")
    page.keyboard.insert_text(texto)


def esperar_tabela(page):
    page.wait_for_selector("table tbody tr", timeout=20000)


def tratar_dialog(dialog):
    print(f"⚠️ Dialog detectado: {dialog.message}")
    dialog.accept()


def verificar_erros(page):
    texto = page.content().lower()
    return "erro" in texto or "inválido" in texto or "invalid" in texto


with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir="perfis/global",
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )

    page = context.new_page()
    page.on("dialog", tratar_dialog)

    # ============================
    # LOGIN INICIAL
    # ============================
    page.goto(BASE)
    print("\n👉 Resolva o CAPTCHA manualmente...")
    input("Pressione ENTER após resolver...")

    # ============================
    # LOOP CNPJs
    # ============================
    for cnpj in CNPJS:
        print(f"\n==============================")
        print(f"🏢 CNPJ: {cnpj}")
        print(f"==============================\n")

        resetar_fluxo(page)

        # LOGIN
        try:
            input_cnpj = page.locator("input[type='text']").first
            input_cnpj.wait_for(timeout=30000)

            colar_cnpj(page, input_cnpj, cnpj)
            page.locator("text=Continuar").click()
            page.wait_for_timeout(5000)

        except Exception as e:
            print(f"❌ Erro login: {e}")
            continue

        # ALERTA PÓS LOGIN
        alerta = capturar_alerta(page, cnpj, "login")
        if alerta:
            print("⚠️ Alerta no login → abortando CNPJ")
            resetar_fluxo(page)
            continue

        if verificar_erros(page):
            print("❌ Erro após login")
            resetar_fluxo(page)
            continue

        # IR PARA EMISSÃO
        page.goto(EMISSAO)
        page.wait_for_timeout(3000)

        try:
            page.wait_for_selector("select", timeout=30000)
        except:
            print("❌ Select não encontrado")
            continue

        dados_total = []

        # ============================
        # LOOP ANOS
        # ============================
        for ano in ANOS:
            print(f"\n📅 Ano: {ano}")

            try:
                page.locator("select").first.select_option(label=ano)
                page.locator("text=OK").click()
                page.wait_for_timeout(3000)

            except Exception as e:
                print(f"⚠️ Erro ano {ano}: {e}")
                continue

            # ALERTA
            alerta = capturar_alerta(page, cnpj, ano)
            if alerta:
                print("⚠️ Alerta detectado → interrompendo CNPJ")
                resetar_fluxo(page)
                break

            if verificar_erros(page):
                print(f"⚠️ Erro no ano {ano}")
                continue

            try:
                esperar_tabela(page)
            except:
                print("⚠️ Tabela não encontrada")
                continue

            rows = page.locator("table tbody tr")
            total = rows.count()

            print(f"📊 Linhas: {total}")

            for i in range(total):
                cols = rows.nth(i).locator("td")
                valores = [
                    cols.nth(j).inner_text().strip()
                    for j in range(cols.count())
                ]

                if valores:
                    dados_total.append([cnpj, ano] + valores)

        # ============================
        # SALVAR CSV
        # ============================
        if dados_total:
            nome_arquivo = f"pgmei_{cnpj}.csv"

            with open(nome_arquivo, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f, delimiter=";")

                writer.writerow([
                    "CNPJ", "Ano", "Recebeu pelo INSS?", "Competência",
                    "Apurado", "", "Status", "Principal", "Multa",
                    "Juros", "Total", "Data de vencimento", "Data de recolhimento"
                ])

                writer.writerows(dados_total)

            print(f"💾 Salvo: {nome_arquivo}")
        else:
            print("⚠️ Nenhum dado coletado")

        # ============================
        # LOGOUT
        # ============================
        try:
            if page.locator("text=Sair").is_visible():
                page.locator("text=Sair").click()
                page.wait_for_timeout(3000)
                print("🔓 Logout realizado")
            else:
                print("⚠️ Logout não encontrado")
        except:
            pass

    # ============================
    # ALERTAS FINAL
    # ============================
    if alertas_capturados:
        arquivo = f"reports/alertas_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        with open(arquivo, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerow(["Horário", "CNPJ", "Ano", "Tipo", "Mensagem", "Screenshot"])

            for alerta in alertas_capturados:
                for msg in alerta["mensagens"]:
                    writer.writerow([
                        alerta["timestamp"],
                        alerta["cnpj"],
                        alerta["ano"],
                        msg["tipo"],
                        msg["texto"],
                        alerta.get("screenshot", "")
                    ])

        print(f"\n📋 Alertas salvos: {arquivo}")
    else:
        print("\n✅ Nenhum alerta crítico")

    context.close()