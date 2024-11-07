import { useState } from "react";
import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;

`;

const TextArea = styled.textarea`
    // Text Area 스타일
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    &::placeholder{
        font-size: 16px;
    }
    &:focus{
        // 테두리 색 변경
        outline: none;
        border-color: #1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    text-align: center;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active{
        opacity: 0.8;
    }
`;

export default function PostTweetForm(){
    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    // 트윗 상태 관리
    const [tweet, setTweet] = useState("");
    // 파일 상태 관리
    const [file, setFile] = useState<File | null>(null);

    // 텍스트 변경 함수
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    };

    // 파일 변경 함수
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if(files && files.length === 1){
            setFile(files[0]);
        }
    };


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // 폼 제출 방지
        e.preventDefault();
        // 현재 사용자 정보 가져오기
        const user = auth.currentUser;
        if(!user || isLoading || tweet === "" || tweet.length > 180){
            return;
        }
        try{
            setIsLoading(true);
            // 데이터베이스에 트윗 저장
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt: Date.now(),
                username: user.displayName || "Anonymous",
                userId: user.uid,
            });
            // 파일 첨부 처리
            if(file){
                const locationRef = ref(storage, `tweets/${user.uid}-${user.displayName}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc, {
                    photo: url,
                });
            }
            setTweet("");
            setFile(null);
        } catch(e){
            // 에러 처리
            console.log(e);
        } finally {
            // 로딩 상태 초기화
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            {/* 트윗 입력 창 */}
            <TextArea rows={5} maxLength={180} value={tweet} onChange={onChange} placeholder="What is happening?" required />
            {/* 파일 첨부 버튼 */}
            <AttachFileButton htmlFor="file">{file ? "Photo added ✅" : "Add Photo"}</AttachFileButton>
            {/* 파일 첨부 입력 */}
            <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
            {/* 트윗 제출 버튼 */}
            <SubmitBtn type="submit" value={isLoading ? "Posting..." : "Post Tweet"} />
        </Form>
    );
}
