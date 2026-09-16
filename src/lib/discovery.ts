/**
 * Camada de descoberta — interpretação de intenção e match.
 *
 * Tudo aqui é determinístico e local. Nenhuma integração externa.
 * A arquitetura antecipa o futuro (DEMANDA → INTERPRETAÇÃO → BUSCA →
 * NORMALIZAÇÃO → DEDUPLICAÇÃO → VALIDAÇÃO → MATCH → RELEVÂNCIA →
 * APRESENTAÇÃO) sem implementar o motor agora.
 */

export type DemandaId = string;
export type ImovelId = string;
export type MatchId = string;

/** Nível de confiança da informação exibida. */
export type Confianca = "confirmado" | "anunciante" | "estimado" | "desconhecido" | "desatualizado";

export const CONFIANCA_LABEL: Record<Confianca, string> = {
  confirmado: "Confirmado",
  anunciante: "Informado pelo anunciante",
  estimado: "Estimado",
  desconhecido: "Não informado",
  desatualizado: "Pode estar desatualizado",
};

export type Fato = {
  label: string;
  valor: string;
  confianca: Confianca;
};

export type Imovel = {
  id: ImovelId;
  /** Origem do dado — anunciante, portal, incorporadora. Sempre visível. */
  origem: string;
  demonstracao: true;
  titulo: string;
  cidade: string;
  bairro: string;
  tipo: "apartamento" | "cobertura" | "casa";
  preco: number;
  precoConfianca: Confianca;
  area: number | null;
  suites: number | null;
  dormitorios: number | null;
  vagas: number | null;
  frenteMar: boolean | null;
  entrega: "pronto" | "planta";
  entregaNota: string | null;
  resumo: string;
  descricao: string;
  caracteristicas: string[];
  fatos: Fato[];
  imagens: string[];
  mapa: { referencia: string; distanciaMar: string | null };
};

/** Intenção interpretada a partir do texto livre do usuário. */
export type Demanda = {
  id: DemandaId;
  texto: string;
  cidade: string | null;
  tipo: Imovel["tipo"] | null;
  suites: number | null;
  dormitorios: number | null;
  vagas: number | null;
  frenteMar: boolean;
  entrega: "pronto" | "planta" | null;
  orcamento: number | null;
};

const CIDADES = [
  "Balneário Camboriú",
  "Itapema",
  "Itajaí",
  "Camboriú",
  "Porto Belo",
  "Bombinhas",
  "Florianópolis",
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function parseOrcamento(texto: string): number | null {
  const t = norm(texto);
  const milhoes = t.match(/(\d+[.,]?\d*)\s*(milhoes|milhao|mi\b|kk\b)/);
  if (milhoes?.[1]) return Math.round(parseFloat(milhoes[1].replace(",", ".")) * 1_000_000);
  const mil = t.match(/(\d+[.,]?\d*)\s*mil\b/);
  if (mil?.[1]) return Math.round(parseFloat(mil[1].replace(",", ".")) * 1_000);
  const bruto = t.match(/r\$\s*([\d.]{4,})/);
  if (bruto?.[1]) {
    const n = Number(bruto[1].replace(/\./g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** INTERPRETAÇÃO: texto livre → critérios estruturados. */
export function interpretar(texto: string): Demanda {
  const t = norm(texto);
  const cidade = CIDADES.find((c) => t.includes(norm(c))) ?? null;

  const tipo: Imovel["tipo"] | null = /cobertura/.test(t)
    ? "cobertura"
    : /\bcasa\b|sobrado/.test(t)
      ? "casa"
      : /apartamento|apto|ap\b/.test(t)
        ? "apartamento"
        : null;

  const num = (re: RegExp) => {
    const m = t.match(re);
    return m?.[1] ? Number(m[1]) : null;
  };

  return {
    id: `dem_${Math.abs(hash(texto)).toString(36)}`,
    texto: texto.trim(),
    cidade,
    tipo,
    suites: num(/(\d+)\s*su[ií]te/),
    dormitorios: num(/(\d+)\s*(?:quarto|dormit)/),
    vagas: num(/(\d+)\s*vaga/),
    frenteMar: /frente\s*-?\s*mar|frente ao mar|beira\s*-?\s*mar|pe na areia/.test(t),
    entrega: /planta|lancamento|lançamento/.test(t)
      ? "planta"
      : /pronto|pronta entrega|para morar/.test(t)
        ? "pronto"
        : null,
    orcamento: parseOrcamento(texto),
  };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** Critérios legíveis da interpretação, para exibir ao usuário. */
export function criteriosDaDemanda(d: Demanda): string[] {
  const out: string[] = [];
  if (d.cidade) out.push(d.cidade);
  if (d.tipo) out.push(capitalize(d.tipo));
  if (d.frenteMar) out.push("Frente-mar");
  if (d.suites) out.push(`${d.suites} suítes`);
  if (d.dormitorios) out.push(`${d.dormitorios} dormitórios`);
  if (d.vagas) out.push(`${d.vagas} vagas`);
  if (d.entrega) out.push(d.entrega === "pronto" ? "Pronto para morar" : "Na planta");
  if (d.orcamento) out.push(`Até ${formatarPreco(d.orcamento)}`);
  return out;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatarPreco(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

// ---------------------------------------------------------------- MATCH

export type CriterioStatus = "atende" | "divergente" | "nao_atende" | "desconhecido";

export type CriterioMatch = {
  chave: string;
  texto: string;
  status: CriterioStatus;
};

export type Match = {
  id: MatchId;
  imovel: Imovel;
  criterios: CriterioMatch[];
  /** 0–100, derivado apenas dos critérios acima. Nunca uma pontuação opaca. */
  score: number;
  classificacao: "compativel" | "parcial";
};

const PESO: Record<CriterioStatus, number> = {
  atende: 1,
  divergente: 0.5,
  desconhecido: 0.4,
  nao_atende: 0,
};

function avaliar(d: Demanda, im: Imovel): CriterioMatch[] {
  const c: CriterioMatch[] = [];

  if (d.cidade) {
    c.push({
      chave: "cidade",
      texto: im.cidade === d.cidade ? d.cidade : `${im.cidade} — não é ${d.cidade}`,
      status: im.cidade === d.cidade ? "atende" : "nao_atende",
    });
  }

  if (d.tipo) {
    c.push({
      chave: "tipo",
      texto:
        im.tipo === d.tipo
          ? capitalize(im.tipo)
          : `${capitalize(im.tipo)} em vez de ${d.tipo}`,
      status: im.tipo === d.tipo ? "atende" : im.tipo === "cobertura" ? "divergente" : "nao_atende",
    });
  }

  if (d.frenteMar) {
    c.push({
      chave: "frenteMar",
      texto:
        im.frenteMar === true
          ? "Frente-mar"
          : im.frenteMar === false
            ? "Não é exatamente frente-mar"
            : "Frente-mar não informado",
      status: im.frenteMar === true ? "atende" : im.frenteMar === false ? "divergente" : "desconhecido",
    });
  }

  if (d.suites) {
    const s = im.suites;
    c.push({
      chave: "suites",
      texto:
        s == null
          ? "Número de suítes não informado"
          : s >= d.suites
            ? `${s} suítes`
            : `${s} suítes em vez das ${d.suites} desejadas`,
      status: s == null ? "desconhecido" : s >= d.suites ? "atende" : "divergente",
    });
  }

  if (d.dormitorios) {
    const q = im.dormitorios;
    c.push({
      chave: "dormitorios",
      texto:
        q == null
          ? "Dormitórios não informados"
          : q >= d.dormitorios
            ? `${q} dormitórios`
            : `${q} dormitórios em vez dos ${d.dormitorios} desejados`,
      status: q == null ? "desconhecido" : q >= d.dormitorios ? "atende" : "divergente",
    });
  }

  if (d.vagas) {
    const v = im.vagas;
    c.push({
      chave: "vagas",
      texto:
        v == null
          ? "Vagas não informadas"
          : v >= d.vagas
            ? `${v} vagas`
            : `${v} vagas em vez das ${d.vagas} desejadas`,
      status: v == null ? "desconhecido" : v >= d.vagas ? "atende" : "divergente",
    });
  }

  if (d.entrega) {
    const ok = im.entrega === d.entrega;
    c.push({
      chave: "entrega",
      texto: ok
        ? d.entrega === "pronto"
          ? "Pronto para morar"
          : "Na planta"
        : im.entrega === "planta"
          ? `Entrega futura${im.entregaNota ? ` — ${im.entregaNota}` : ""}`
          : "Já pronto",
      status: ok ? "atende" : "divergente",
    });
  }

  if (d.orcamento) {
    const acima = im.preco > d.orcamento;
    c.push({
      chave: "orcamento",
      texto: acima
        ? `${formatarPreco(im.preco)} — acima do orçamento informado`
        : "Dentro do orçamento",
      status: acima ? (im.preco <= d.orcamento * 1.12 ? "divergente" : "nao_atende") : "atende",
    });
  }

  return c;
}

/** MATCH + RELEVÂNCIA: nunca esconde incompatibilidade. */
export function buscar(d: Demanda, imoveis: Imovel[]): Match[] {
  return imoveis
    .map((imovel) => {
      const criterios = avaliar(d, imovel);
      const score = criterios.length
        ? Math.round(
            (criterios.reduce((sum, c) => sum + PESO[c.status], 0) / criterios.length) * 100,
          )
        : 60;
      const reprovado = criterios.some((c) => c.status === "nao_atende");
      const divergente = criterios.some((c) => c.status !== "atende");
      return {
        id: `mat_${d.id}_${imovel.id}`,
        imovel,
        criterios,
        score,
        classificacao: (reprovado || divergente ? "parcial" : "compativel") as Match["classificacao"],
      };
    })
    .filter((m) => m.score >= 50)
    .sort((a, b) => b.score - a.score);
}

/** Onde a busca precisou ser flexibilizada, em linguagem humana. */
export function flexibilizacoes(matches: Match[]): { mantido: string[]; flexibilizado: string[] } {
  const mantido = new Set<string>();
  const flexibilizado = new Set<string>();
  const nome: Record<string, string> = {
    cidade: "a cidade",
    tipo: "o tipo de imóvel",
    frenteMar: "frente-mar",
    suites: "as suítes",
    dormitorios: "os dormitórios",
    vagas: "as vagas",
    entrega: "o prazo de entrega",
    orcamento: "o orçamento",
  };
  for (const m of matches) {
    for (const c of m.criterios) {
      const label = nome[c.chave] ?? c.chave;
      if (c.status === "atende") mantido.add(label);
      else flexibilizado.add(label);
    }
  }
  for (const f of flexibilizado) mantido.delete(f);
  return { mantido: [...mantido], flexibilizado: [...flexibilizado] };
}
