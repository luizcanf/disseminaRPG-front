import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/ApiService";
import {
  descricoesImagens,
  imagens,
  jogadores,
} from "../components/LoginButtons";

export function Master() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [numeroInimigos, setNumeroInimigos] = useState<number | "">(
    Number(localStorage.getItem("numeroInimigos")) || 10
  );


  const handleClickVota = () => {
    navigate(`/votacao-dados/${id}`);
  };
  const handleAtualizarVida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || numeroInimigos === "") return;

    try {
      console.log("enviando numeroInimigos: ", numeroInimigos);
      const res = await api.post(`mestre/jogador${id}/vida`, {
        numeroInimigos: numeroInimigos,
      });
      console.log("Número de inimigos enviado:", res.data);
      localStorage.setItem("numeroInimigos", numeroInimigos + "");
    } catch (err) {
      console.error("Erro ao atualizar número de inimigos:", err);
    }
  };

  return (
    <div>
      <Header isMaster={true} />
      <div id="tudo">
        {imagens[Number(id) - 1]
          ? <img src={imagens[Number(id) - 1]} id="img1" className="portrait" alt={descricoesImagens[Number(id) - 1]} />
          : <div className="imagem-placeholder portrait" aria-label={descricoesImagens[Number(id) - 1]}>{jogadores[Number(id) - 1]}</div>
        }
        <section className="principal">
          <h1>Mestre - {jogadores[Number(id) - 1]}</h1>
          <div>
            <form onSubmit={handleAtualizarVida} className="bloco">
              <h2 style={{ fontWeight: "bold" }}>Número de Inimigos</h2>
              <h3>Inimigos atuais: {numeroInimigos !== "" ? numeroInimigos : 10}</h3>
              <div
                style={{
                  display: "flex",
                  flexFlow: "column",
                  alignItems: "center",
                }}
              >
                <label htmlFor="numeroInimigos">Modificar número de inimigos</label>
                <input
                  type="number"
                  value={numeroInimigos}
                  onChange={(e) => setNumeroInimigos(Number(e.target.value))}
                  className="input-number"
                  id="numeroInimigos"
                  min={0}
                />
              </div>

              <button type="submit" className="botao-enviar">
                Atualizar Inimigos
              </button>
            </form>
            {/* <form>
              <button
                className="button"
                id="btnRolagem"
                onClick={handleClickDados}
              >
                Rolagem de dados
              </button>
            </form> */}
            <form>
              <button
                className="button"
                id="btnEscolhas"
                onClick={handleClickVota}
              >
                Criar Votação / Rolagem
              </button>
            </form>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
