import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";

export default function CreateAccount(){
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: {name, value} } = e;
        // name에 값이 입력되면 setName에 저장
        if (name === "name") {
            setName(value)
        
        }
        // email에 값이 입력되면 setEmail에 저장
        else if (name === "email"){
            setEmail(value)
        } 
        // password에 값이 입력되면 setPassword에 저장
        else if (name === "password") {
            setPassword(value)
        }
    };
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        //form에 값이 다 입력되고 submit 버튼을 클릭하면 페이지를 새로그침
        e.preventDefault();
        setError("");
        if (isLoading || name === "" || email === "" || password === "") return;
        try {
            setLoading(true);
            // 계정 생성하기
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            // console.log(credentials.user)
            await updateProfile(credentials.user, {
                displayName: name,
            });
            navigate("/");
            // user의 이름을 정의

            // 계정 생성이 완료되면 홈페이지로 페이지 이동
        } catch(e) {
            // 에러가 발생할 경우 무슨 에러인지 확인
            // console.log(e);
            if (e instanceof FirebaseError) {
                console.log(e.code, e.message);
                setError(e.message);
            }
        } finally {
            setLoading(false)
        }
        
        console.log(name, email, password);
    }

    return <Wrapper>
        <Title>Join 🅧</Title>
        <Form onSubmit={onSubmit}>
            <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required />
            <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required />
            <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required />
            
            {/* submit 버튼을 클릭하면 Loading...이라는 글자를 보여주고 아니면 Create Account창을 계속 보여준다 */}
            <Input type="submit" value={isLoading ? "Loading..." : "Create Account"} />
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Switcher>
            Already have an account? <Link to ="/login">Log in &rarr;</Link>
        </Switcher>
    </Wrapper>
}