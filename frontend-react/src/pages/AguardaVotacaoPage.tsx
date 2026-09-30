import { useParams } from "react-router-dom";
import { useSSE } from "../services/SSEService";
import { imagens, jogadores } from "../components/LoginButtons";
import { useState } from "react";
import { Votacao_Estado } from "../components/Dados";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";

// Uma rolagem individual dentro de um ataque de inimigo
interface RolagemAtaque {
  name: string;
  resultado: number | number[];
  bonus: number;
  total: number;
}

// Um ataque individual de um inimigo (contém N rolagens, uma por dado configurado)
interface Ataque {
  rolagens: RolagemAtaque[];
}

// Cada jogador-alvo no resultado da votação
interface ResultadoJogador {
  name: string;
  votos: number;
  porcentagem: number;
  // quantidadeAtaques = número de inimigos direcionados para este jogador
  quantidadeAtaques: number;
  // Rolagens individuais de cada inimigo (presente quando há dados configurados)
  ataques?: Ataque[];
}

interface VotacaoEstadoResponse {
  votosTotal: number;
  numeroInimigos: number;
  result: ResultadoJogador[];
}

// Encontra o índice (1-based) de um jogador pelo nome para exibir a imagem futuramente
function jogadorIdPorNome(nome: string): number {
  const idx = jogadores.indexOf(nome);
  return idx >= 0 ? idx + 1 : -1;
}

export default function AguardaVotacaoPage() {
  const { id } = useParams();
  const { sseValue, connected } = useSSE(id, "votos");
  console.log("votossse: ", sseValue, connected);

  const [loading, setLoading] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState<VotacaoEstadoResponse | null>(null);

  const navigate = useNavigate();

  const verResultadoVotacao = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await Votacao_Estado(id);
      setResultado(res);
      setMostrarResultado(true);
    } catch {
      alert("Erro ao buscar resultado da votação");
    } finally {
      setLoading(false);
    }
  };

  // Ordena: mais votos (mais inimigos) primeiro
  const opcoesOrdenadas = resultado
    ? [...resultado.result].sort((a, b) => b.votos - a.votos)
    : [];

  const maisvotado = opcoesOrdenadas[0] ?? null;
  const demais = opcoesOrdenadas.slice(1);

  // Renderiza as rolagens individuais de cada inimigo contra um jogador
  const renderizarAtaques = (ataques: Ataque[]) => (
    <div className="ataques-container">
      {ataques.map((ataque, aIndex) => (
        <div key={aIndex} className="ataque-item">
          <h3>Inimigo {aIndex + 1}</h3>
          {ataque.rolagens.map((r, rIndex) => (
            <div key={rIndex} className="rolagem-detalhes">
              <strong>{r.name}: </strong>
              <span>
                {Array.isArray(r.resultado)
                  ? r.resultado.join(" + ")
                  : r.resultado}
                {r.bonus > 0 ? ` + ${r.bonus}` : ""}
                {" = "}
                <strong>{r.total}</strong>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Renderiza o card de um jogador-alvo no resultado
  const renderizarCardJogador = (item: ResultadoJogador, destaque: boolean) => {
    const jogadorId = jogadorIdPorNome(item.name);
    const imagemJogador = jogadorId > 0 ? imagens[jogadorId - 1] : undefined;

    return (
      <div className={`resultado-item ${destaque ? "vencedor" : "perdedor"}`}>
        {/* Espaço reservado para imagem do personagem */}
        {imagemJogador
          ? <img src={imagemJogador} alt={item.name} className="resultado-jogador-img" />
          : <div className="imagem-placeholder resultado-jogador-img" aria-label={item.name}>{item.name}</div>
        }

        <h1>{item.name}</h1>
        <h2><strong>Votos: {item.votos}</strong></h2>

        {/* Barra de progresso */}
        <div className="progresso-container">
          <div
            className="progresso-barra"
            style={{ width: `${item.porcentagem}%` }}
          />
          <h2>
            {destaque && "Porcentagem de votos: "}
            <span className="progresso-texto">{item.porcentagem}%</span>
          </h2>
        </div>

        <h2>
          {item.quantidadeAtaques}{" "}
          {item.quantidadeAtaques === 1 ? "inimigo ataca" : "inimigos atacam"}
        </h2>

        {/* Rolagens individuais dos inimigos contra este jogador */}
        {item.ataques && item.ataques.length > 0 && renderizarAtaques(item.ataques)}
      </div>
    );
  };

  return (
    <>
      <Header isMaster={true} />
      <div id="tudo">
        <main className="conteudo">
          <h1>Aguardando votação — {jogadores[Number(id) - 1]}</h1>
          <h2>Votos totais: {sseValue}</h2>
          <div className="button" onClick={verResultadoVotacao}>
            {loading ? "Carregando..." : "Ver Resultado e fechar votação"}
          </div>
        </main>

        {mostrarResultado && resultado && (
          <div className="result-options-modal">
            <div className="result-options-modal-content">
              <button
                className="button"
                onClick={() => {
                  setMostrarResultado(false);
                  navigate(`/goiabada/${id}`);
                }}
              >
                X
              </button>

              <h1 id="votacao-resultado">Quem será atacado?</h1>
              <h2 id="total-votacao">Total de votos: {resultado.votosTotal}</h2>
              <h2>Total de inimigos: {resultado.numeroInimigos}</h2>

              <div className="result-options-main-container">

                {/* Mais votado — coluna esquerda */}
                {maisvotado && (
                  <div className="vencedor-container">
                    {renderizarCardJogador(maisvotado, true)}
                  </div>
                )}

                {/* Demais jogadores — coluna direita */}
                <div className="perdedores-container">
                  {demais.map((item, index) => (
                    <div key={index}>
                      {renderizarCardJogador(item, false)}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
