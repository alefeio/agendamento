import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

export const GoTo = ({ tab }: string) => {
    console.log('tab', tab)
    return navigate(`/restrito?tab=${tab}`); // Navega para a URL com o parâmetro
};