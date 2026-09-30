import { useNavigate } from "react-router-dom"
import Atnos from "../assets/Atnos.jpg"
import Sam from "../assets/sam.jpg"
import Zenchi from "../assets/zenchi.jpg"


type CharProps = {
    CharNumber: number;
}
type MasterProps = {
    MasterNumber: number;
}
export const jogadores: string[] = ["Zenchi", "Atnos", "Sam", "Jogador 4", "Jogador 5"];
// imagens: adicionar jogador4Img e jogador5Img aqui quando disponíveis
// import jogador4Img from "../assets/jogador4.jpg"
// import jogador5Img from "../assets/jogador5.jpg"
export const imagens: (string | undefined)[] = [Zenchi, Atnos, Sam, undefined, undefined];
const descricoes: string[] = [
"Um jovem espadachim e aprendiz de feiticeiro. Ele é extrovertido e engraçado, gosta de festas e aventuras, mas não foge de uma boa luta.",
"Cerca de 30 anos, baixo, mais calmo e reservado. Costuma agir mais escondido do que os outros.",
"23 anos,  bem sarcástico, muito confiante,  faz piada com tudo na maior parte do tempo tá de bom humor.",
"Personagem a definir.",
"Personagem a definir.",
];
export const descricoesImagens: string[] = [
    "Zenchi: Armadura leve e roupas vermelhas, forte e sorridente com uma katana",
    "Atnos: Um manto preto largo com capuz reservado e uma adaga",
    "Sam: Uma blusa com ombreiras, bobo, com uma espada",
    "Jogador 4: imagem a adicionar",
    "Jogador 5: imagem a adicionar",
]

export function CharButtons( { CharNumber } : CharProps) {
    // console.log("Jogadores:", jogadores);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/player/${CharNumber}`);
    }
    return (
        <div className="card_jogador">
            <fieldset >
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                {imagens[CharNumber - 1]
                    ? <img src={imagens[CharNumber - 1]} alt={`${descricoesImagens[CharNumber - 1]}`} />
                    : <div className="imagem-placeholder" aria-label={descricoesImagens[CharNumber - 1]}>{jogadores[CharNumber - 1]}</div>
                }
                <br />
                <h2 role="descrição">{descricoes[CharNumber - 1]}</h2>
                </div>
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <button onClick={handleClick}>
                        <span>Jogar com {jogadores[CharNumber - 1]}</span>
                    </button>
                </form>
            </fieldset>
        </div>
    )
}

export function MasterButtons( { MasterNumber } : MasterProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/goiabada/${MasterNumber}`);
    }
    return (
        <div>
            <fieldset>
                <legend> Jogador {MasterNumber} </legend>
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <button onClick={handleClick}>
                        <span>Mestre do {jogadores[MasterNumber - 1]}</span>
                    </button>
                </form>
            </fieldset>
        </div>
    )
}