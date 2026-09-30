import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/ApiService";
import { jogadores, imagens } from "../components/LoginButtons";
import { toast } from "react-toastify";

interface DadoVotacao {
    lados: number;
    quantidade: number;
    name: string;
    bonus?: number;
}

// Representa a configuração de dados para um dos 5 jogadores-alvo
interface OpcaoJogador {
    // nome do jogador — vem do array jogadores[], não é editável pelo mestre
    name: string;
    // índice 1-based do jogador (1..5), usado para exibir a imagem futuramente
    jogadorId: number;
    dados: DadoVotacao[];
}

// Dados padrão sugeridos para os inimigos atacarem cada jogador
// O mestre pode customizar livremente após carregar os padrões
const dadosPadraoInimigos: DadoVotacao[] = [
    { name: "Ataque", lados: 20, quantidade: 1, bonus: 0 },
    { name: "Dano", lados: 6, quantidade: 1, bonus: 0 },
];

// Inicializa as 5 opções fixas (uma por jogador) com dados padrão
function criarOpcoesIniciais(nomes: string[]): OpcaoJogador[] {
    return nomes.map((nome, i) => ({
        name: nome,
        jogadorId: i + 1,
        dados: dadosPadraoInimigos.map(d => ({ ...d })), // cópia para evitar referência compartilhada
    }));
}

export function VotacaoComDados() {
    const { id } = useParams();
    const navigate = useNavigate();

    // As 5 opções são os próprios jogadores — o mestre só configura os dados de cada um
    const [opcoes, setOpcoes] = useState<OpcaoJogador[]>(() =>
        criarOpcoesIniciais(jogadores)
    );

    // --- Helpers de atualização ---

    const adicionarDado = (opcaoIndex: number) => {
        const novasOpcoes = [...opcoes];
        novasOpcoes[opcaoIndex].dados.push({ name: "", lados: 0, quantidade: 1, bonus: 0 });
        setOpcoes(novasOpcoes);
    };

    const removerDado = (opcaoIndex: number, dadoIndex: number) => {
        const novasOpcoes = [...opcoes];
        novasOpcoes[opcaoIndex].dados.splice(dadoIndex, 1);
        setOpcoes(novasOpcoes);
    };

    const atualizarDado = (
        opcaoIndex: number,
        dadoIndex: number,
        campo: keyof DadoVotacao,
        valor: number | string
    ) => {
        const novasOpcoes = [...opcoes];
        const dado = novasOpcoes[opcaoIndex].dados[dadoIndex];
        if (campo === "name") {
            dado.name = valor as string;
        } else {
            (dado[campo] as number) = valor as number;
        }
        setOpcoes(novasOpcoes);
    };

    const restaurarDadosPadrao = (opcaoIndex: number) => {
        const novasOpcoes = [...opcoes];
        novasOpcoes[opcaoIndex].dados = dadosPadraoInimigos.map(d => ({ ...d }));
        setOpcoes(novasOpcoes);
    };

    // --- Envio ---

    const criarVotacao = async () => {
        if (!id) return;

        // Valida: cada jogador precisa ter ao menos 1 dado válido
        const opcoesInvalidas = opcoes.filter(op =>
            op.dados.length === 0 ||
            op.dados.some(d => d.name.trim() === "" || d.lados <= 0 || d.quantidade <= 0)
        );

        if (opcoesInvalidas.length > 0) {
            const nomes = opcoesInvalidas.map(o => o.name).join(", ");
            toast.warn(`Corrija os dados de: ${nomes}`);
            return;
        }

        try {
            // O payload mantém o mesmo formato que o backend já espera
            const payload = {
                opcoes: opcoes.map(op => ({
                    name: op.name,
                    dados: op.dados,
                })),
            };
            await api.post(`/mestre/jogador${id}/criaVotacaoComDado`, payload);
            toast.success("Votação criada com sucesso!");
            navigate(`/goiabada/${id}/aguarda-votacao`);
        } catch {
            toast.error("Erro ao criar votação");
        }
    };

    return (
        <div>
            <Header isMaster={true} />
            <div id="tudo">
                <section>
                    <h1>Configurar Ataque dos Inimigos</h1>
                    <p className="instrucoes">
                        O auditório vai votar em <strong>qual jogador será atacado</strong>.
                        Configure abaixo os dados que os inimigos usarão contra cada jogador.
                    </p>

                    <div className="votacao-config" id="dados-customizados">
                        {opcoes.map((opcao, opcaoIndex) => (
                            <div key={opcaoIndex} className="opcao-container">
                                <div className="opcao-header">
                                    {/* Espaço reservado para a imagem do personagem */}
                                    {imagens[opcao.jogadorId - 1]
                                        ? <img
                                            src={imagens[opcao.jogadorId - 1]}
                                            alt={opcao.name}
                                            className="opcao-jogador-img"
                                          />
                                        : <div className="imagem-placeholder opcao-jogador-img" aria-label={opcao.name}>
                                            {opcao.name}
                                          </div>
                                    }
                                    <h2 className="opcao-nome">{opcao.name}</h2>
                                </div>

                                <div className="dados-config">
                                    {opcao.dados.map((dado, dadoIndex) => (
                                        <div key={dadoIndex} className="dado-inputs-row">
                                            <input
                                                type="text"
                                                placeholder="Nome do dado"
                                                value={dado.name}
                                                onChange={(e) =>
                                                    atualizarDado(opcaoIndex, dadoIndex, "name", e.target.value)
                                                }
                                            />
                                            <div style={{ display: "flex", alignItems: "center" }}>
                                                <input
                                                    type="number"
                                                    placeholder="Qtd"
                                                    className="input-number"
                                                    value={dado.quantidade > 0 ? dado.quantidade : ""}
                                                    min={1}
                                                    onChange={(e) =>
                                                        atualizarDado(opcaoIndex, dadoIndex, "quantidade", parseInt(e.target.value) || 1)
                                                    }
                                                />
                                                <span>D</span>
                                                <input
                                                    type="text"
                                                    id="ilados"
                                                    placeholder="Lados"
                                                    list="lados-list"
                                                    value={dado.lados > 0 ? dado.lados : ""}
                                                    onChange={(e) =>
                                                        atualizarDado(opcaoIndex, dadoIndex, "lados", parseInt(e.target.value) || 0)
                                                    }
                                                />
                                                <datalist id="lados-list">
                                                    <option>2</option>
                                                    <option>4</option>
                                                    <option>6</option>
                                                    <option>8</option>
                                                    <option>10</option>
                                                    <option>12</option>
                                                    <option>14</option>
                                                    <option>16</option>
                                                    <option>18</option>
                                                    <option>20</option>
                                                </datalist>
                                            </div>
                                            <input
                                                type="number"
                                                className="input-number"
                                                value={dado.bonus && dado.bonus > 0 ? dado.bonus : ""}
                                                placeholder="Bônus"
                                                onChange={(e) =>
                                                    atualizarDado(opcaoIndex, dadoIndex, "bonus", parseInt(e.target.value) || 0)
                                                }
                                            />
                                            <div
                                                className="button-remover"
                                                onClick={() => removerDado(opcaoIndex, dadoIndex)}
                                            >
                                                Remover Dado
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        <div className="button" onClick={() => adicionarDado(opcaoIndex)}>
                                            + Dado
                                        </div>
                                        <div className="button" onClick={() => restaurarDadosPadrao(opcaoIndex)}>
                                            Restaurar Padrão
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="controles-votacao">
                        <div className="button" onClick={criarVotacao}>
                            Iniciar Votação
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
}
