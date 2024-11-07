import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

// 트윗 컴포넌트 래퍼 스타일
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;
const Column = styled.div``;
// 트윗 컴포넌트 사진 스타일
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;
// 트윗 컴포넌트 유저네임 스타일
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;
// 트윗 컴포넌트 페이로드 스타일
const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;
// 트윗 컴포넌트 삭제 버튼 스타일
const DeleteButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

// 트윗 컴포넌트 함수
export default function Tweet({ username, photo, tweet, id, userId }: ITweet) {
    // 현재 유저 정보
    const user = auth.currentUser;
    // 트윗 삭제 함수
    const onDelete = async () => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        // 삭제 확인 여부 확인
        if (!ok || user?.uid !== userId) return;
        // 트윗 삭제 시도
        try {
            // 트윗 삭제
            await deleteDoc(doc(db, "tweets", id));
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            console.log(e);
        } finally {
            // 삭제 완료 알림
        }
        
    };
    return (
        <Wrapper>
            <Column>
                <Username>{username}</Username>
                <Payload>{tweet}</Payload>
                { user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
            </Column>
            <Column>
                {photo ? (
                    <Photo src={photo} />
                ) : null}
            </Column>
        </Wrapper>
    );
}