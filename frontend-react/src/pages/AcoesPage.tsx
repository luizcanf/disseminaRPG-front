/* eslint-disable no-irregular-whitespace */
import { Ver_Votacao } from "../components/Dados";
import { Deposita_Votos } from "../components/Dados";
import { Deposita_Votos_Com_Dado } from "../components/Dados";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface DadoVotacaoInfo {
  name: string;
  lados: number;
  quantidade: number;
  bonus?: number;
}
interface OpcaoComDado {
  name: string;
  dados: DadoVotacaoInfo[];
}

interface VotacaoResponse {
  opcoes?: string[];
  opcoesComDado?: OpcaoComDado[];
  votacaoAberta: boolean;
  mensagem?: string;
}

export function AcoesPage() {
  const { id } = useParams();
  const [votacao, setVotacao] = useState<string[] | null>(null);
  const [votacaoComDado, setVotacaoComDado] = useState<OpcaoComDado[] | null>(
    null
  );
  const [votoComputado, setVotoComputado] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string>("");
  const [result, setResultado] = useState<any>();

  // Inicializar UID
  useEffect(() => {
    let uid = localStorage.getItem("uid");
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem("uid", uid);
    }
    // Carregar votação inicial
    handleVerVotacao();
  }, [id]);

  const handleVerVotacao = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const resultado = (await Ver_Votacao(id)) as VotacaoResponse | null;
      console.log("Resultado da votacao:", resultado);
      setVotoComputado(false);

      if (resultado?.opcoesComDado && resultado.opcoesComDado.length > 0) {
        setVotacaoComDado(resultado.opcoesComDado);
        setVotacao(null);
        setMensagem(
          "Votação com dados ativa! Escolha uma opção para rolar os dados."
        );
      } else if (resultado?.opcoes && resultado.opcoes.length > 0) {
        setVotacao(resultado.opcoes);
        setVotacaoComDado(null);
        setMensagem("Votação normal ativa! Escolha uma opção.");
      } else {
        setVotacao(null);
        setVotacaoComDado(null);
        setMensagem(resultado?.mensagem || "Nenhuma votação ativa no momento.");
      }
    } catch (error) {
      console.error("Erro ao buscar votação:", error);
      setMensagem("Erro ao carregar votação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVotar = async (opcao: string) => {
    if (!id || votoComputado) return;

    try {
      setLoading(true);
      await Deposita_Votos(id, opcao);
      setVotoComputado(true);
      setMensagem(`✅ Voto computado para: ${opcao}`);
    } catch (error: any) {
      console.error("Erro ao votar:", error);
      if (error.response?.status === 403) {
        setMensagem("❌ Você já votou nesta votação!");
        setVotoComputado(true);
      } else {
        setMensagem(
          error.response?.data?.erro || "Erro ao votar. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVotarComDado = async (opcao: OpcaoComDado) => {
    if (!id || votoComputado) return;

    try {
      setLoading(true);
      const resultado = await Deposita_Votos_Com_Dado(id, opcao.name);
      setVotoComputado(true);
      setResultado(resultado);
      let mensagemRolagem = `✅ Voto computado para: ${opcao.name}`;
      // if (resultado?.valoresDasRolagem) {
      //     const rolagens = resultado.valoresDasRolagem.map((r: any) =>
      //         `${r.name}: ${Array.isArray(r.rolagem) ? r.rolagem.join(' + ') : r.rolagem}`
      //     ).join(' | ');
      //     mensagemRolagem += ` | 🎲 Rolagens: ${rolagens}`;
      // }
      setMensagem(mensagemRolagem);
    } catch (error: any) {
      console.error("Erro ao votar com dado:", error);
      if (error.response?.status === 403) {
        setMensagem("❌ Você já votou nesta votação!");
        setVotoComputado(true);
      } else {
        setMensagem(
          error.response?.data?.erro || "Erro ao votar. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div id="tudo">
        <div id="centralizar-botao">
          <div className="votacao-info">
            <h1>Votação - Quem será atacado?</h1>
            <p className="instrucoes">O auditório escolhe qual personagem os inimigos irão atacar.</p>

            {mensagem && (
              <div
                className={`mensagem ${
                  mensagem.includes("✅")
                    ? "mensagem-sucesso"
                    : mensagem.includes("❌")
                    ? "mensagem-erro"
                    : "mensagem-info"
                }`}
                style={{ fontSize: "22px" }}
              >
                {mensagem}
              </div>
            )}
          </div>

          <div className="controles-jogador">
            <div className="button" onClick={handleVerVotacao}>
              {loading ? "🔄 Atualizando..." : "🔄 Atualizar Votação"}
            </div>
          </div>

          {votacaoComDado && votacaoComDado.length > 0 && (
            <div className="votacao-container">
              <h2>🎲 Votar em um personagem</h2>
              <p className="instrucoes">
                Clique no personagem que você quer que os inimigos ataquem
              </p>

              <div className="opcoes-grid">
                {votacaoComDado.map((opcao, index) => (
                  <div
                    // CORREÇÃO CRÍTICA: Se votoComputado for TRUE, a classe deve ser 'opcao-inativa'
                    className={`opcao-voto ${
                      !votoComputado ? "opcao-ativa" : "opcao-inativa"
                    }`}
                    key={index} // O onClick também depende de votoComputado
                    onClick={() => !votoComputado && handleVotarComDado(opcao)}
                  >
                                                       {" "}
                    <div className="opcao-conteudo">
                      <button className="opcao-nome button">
                        {opcao.name}
                      </button>
                      <div className="dados-lista">
                        {opcao.dados?.map((d, dIndex) => (
                          <div key={dIndex} className="dado-info">
                            🎲 {d.name} ({d.quantidade}D{d.lados}
                            {d.bonus ? ` + ${d.bonus}` : ""})
                          </div>
                        ))}
                      </div>
                    </div>
                                                   {" "}
                  </div>
                ))}
                {result && mensagem && (
                  <div className="modal">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="button"
                        onClick={() => setResultado(null)}
                      >
                        X
                      </button>
                      <h1>{mensagem}</h1>
                      <div className="modal_resultado">
                        {result.valoresDasRolagem.map((d: any, i: any) => {
                          console.log(`dado ${i}\n${d}`);
                          return (
                            <div className="dado-opt">
                              <h2>{d.name}</h2>
                              <h3>Rolagens</h3>
                              <h3>
                                {Array.isArray(d.rolagem)
                                  ? d.rolagem.join(", ")
                                  : d.rolagem}
                              </h3>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {votacao && votacao.length > 0 && (
            <div className="votacao-container">
              <h2>📊 Votar em um personagem</h2>
              <p className="instrucoes">Clique no personagem que você quer que os inimigos ataquem</p>

              <div className="opcoes-grid">
                {votacao.map((opcao, index) => (
                  <div
                    className={`opcao-voto ${
                      !votoComputado ? "opcao-ativa" : "opcao-inativa"
                    }`}
                    key={index}
                    onClick={() => !votoComputado && handleVotar(opcao)}
                  >
                    <div className="button">{opcao}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!votacao && !votacaoComDado && !loading && (
            <div className="nenhuma-votacao">
              <h2>⏳ Nenhuma votação ativa</h2>
              <p>
                Clique em "Atualizar Votação" quando o mestre iniciar uma nova
                votação
              </p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
