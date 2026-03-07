LIMITE_MEI = 81000.00
LIMITE_MEI_EXCESSO = 81000.00 * 1.20  # R$ 97.200

class AlertaService:
    def verificar_limite_mei(self, total_anual: float) -> str | None:
        percentual = (total_anual / LIMITE_MEI) * 100

        if total_anual > LIMITE_MEI_EXCESSO:
            return f'🚨 Você ultrapassou R$ 97.200! Desenquadramento retroativo obrigatório.'
        elif total_anual > LIMITE_MEI:
            return f'⚠️ Você ultrapassou o limite MEI (R$ 81.000). Considere mudar de regime no próximo ano.'
        elif percentual >= 90:
            return f'🚨 Atenção! Você atingiu {percentual:.1f}% do limite anual MEI!'
        elif percentual >= 75:
            return f'⚠️ Você atingiu {percentual:.1f}% do limite anual MEI.'
        return None