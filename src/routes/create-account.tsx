import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Form, Error, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { doc, setDoc } from "firebase/firestore";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "userId") {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setUserId(sanitizedValue);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || name === "" || userId === "" || email === "" || password === "") return;
    
    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credentials.user, {
        displayName: name,
      });
      await setDoc(doc(db, "users", credentials.user.uid), {
        name,
        email,
        userId: `@${userId}`,
        createdAt: Date.now(),
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Join 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required />
        <Input onChange={onChange} name="userId" value={userId} placeholder="Username" type="text" pattern="[a-zA-Z0-9]+" title="Only letters and numbers are allowed" required />
        <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required />
        <Input onChange={onChange} value={password} name="password" placeholder="Password" type="password" required />
        <Input type="submit" value={isLoading ? "Loading..." : "Create Account"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <Switcher>
        Don't remember your password? <Link to="/change-password">Change Password &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
