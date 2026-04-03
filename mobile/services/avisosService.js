// services/avisosService.js

export const getLinksUteis = () => {
  return [
    {
      id: 1,
      emoji: '🏛️',
      titulo: 'Portal do Empreendedor',
      url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor'
    },
    {
      id: 2,
      emoji: '📝',
      titulo: 'Abrir MEI',
      url: 'https://mei.receita.economia.gov.br/inscricao/login'
    },
    {
      id: 3,
      emoji: '🔍',
      titulo: 'Consulta Optante do Simples Nacional',
      url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao'
    },
    {
      id: 4,
      emoji: '🧾',
      titulo: 'Emitir DAS',
      url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao'
    }
  ];
};

export const getAvisos = () => {
  return [
    {
      id: 1,
      titulo: 'Sempre pague o seu DAS em dia',
      descricao: 'O não pagamento gera multa, juros e pode causar o desenquadramento do Simples Nacional.'
    },
    {
      id: 2,
      titulo: 'DASN-SIMEI — Declaração Anual',
      descricao: 'Deve ser entregue até 31 de maio de cada ano, mesmo sem faturamento.\n\nA omissão gera multa mínima de R$ 50,00 por declaração.'
    },
    {
      id: 3,
      titulo: 'Limite de faturamento',
      descricao: 'O MEI pode faturar até R$ 81.000/ano (média de R$ 6.750/mês).\n\nUltrapassar esse valor resulta em desenquadramento e cobrança retroativa de impostos.'
    },
    {
      id: 4,
      titulo: 'Limite de funcionários',
      descricao: 'O MEI pode contratar no máximo 1 funcionário, com salário mínimo ou piso da categoria.\n\nÉ obrigatório registrar em carteira e recolher o eSocial.'
    },
    {
      id: 5,
      titulo: 'Não pode ser sócio de outra empresa',
      descricao: 'O MEI não pode ser titular, sócio ou administrador de outra empresa.\n\nCaso contrário, perde o enquadramento.'
    },
    {
      id: 6,
      titulo: 'Emissão de Nota Fiscal',
      descricao: 'É obrigatório emitir NF para clientes pessoa jurídica.\n\nPara pessoa física, apenas se solicitado.'
    },
    {
      id: 7,
      titulo: 'Atividades permitidas',
      descricao: 'Nem todas as atividades podem ser exercidas como MEI.\n\nVerifique se sua atividade consta na lista oficial no Portal do Empreendedor.'
    },
    {
      id: 8,
      titulo: 'CNPJ irregular',
      descricao: 'Débitos em aberto podem negativar o CNPJ e impedir acesso a crédito, licitações e emissão de certidões.'
    }
  ];
};
