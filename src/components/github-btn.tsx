import { GithubAuthProvider, signInWithRedirect } from "firebase/auth";
import styled from "styled-components"
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Button = styled.span`
    margin-top: 50px;
    background-color: white;
    font-weight: 500;
    width: 100%;
    color: black;
    padding: 10px 20px;
    border-radius: 50px;
    border: 0;
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const Logo = styled.img`
    height: 25px
`;

export default function GithubButton() {
    const navigate = useNavigate();
    const onClick = async () => {
        try {
            const provider = new GithubAuthProvider();
            // 이렇게 하면 해당 창에서 클릭했을 때 해당 창이 redirect 되면서 github authorized 화면으로 넘어간다
            await signInWithRedirect(auth, provider);
            // 이렇게 하면 해당 창에서 클릭했을 때 해당 창이 pop-up 되면서 github authorized 화면으로 넘어간다
            // await signInWithPopup(auth, provider);

            // 아래의 구문은 위의 소스가 완료되면 해당 페이지로 이동하라는 구문이다.
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };
    return ( 
        <Button onClick={onClick}>
            <Logo src="/github-mark.svg" />
            Continue with Github
        </Button>
    )
}