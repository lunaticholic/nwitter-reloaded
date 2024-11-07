import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";

// 스타일 컴포넌트들
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
    margin-bottom: 20px;
    position: relative;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const UserId = styled.span`
    color: #71767b;
    font-size: 15px;
`;

const Dot = styled.span`
    color: #71767b;
    font-size: 15px;
    margin: 0 4px;
`;

const CreatedAt = styled.span`
    color: #71767b;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
    line-height: 1.5;
`;

const Photo = styled.img`
    width: 100%;
    height: auto;
    max-height: 450px;
    border-radius: 15px;
    margin-bottom: 15px;
    object-fit: cover;
`;

// 메뉴 관련 스타일
const MenuContainer = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
`;

const MenuButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    color: white;
    &:hover {
        color: #1d9bf0;
    }
`;

const DropdownMenu = styled.div<{isOpen: boolean}>`
    position: absolute;
    right: 0;
    top: 25px;
    background-color: black;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 5px 0px;
    display: ${props => props.isOpen ? "block" : "none"};
    z-index: 10;
    min-width: 100px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
`;

const MenuItem = styled.button`
    width: 100%;
    padding: 8px 15px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    text-align: center;
    font-size: 14px;
    display: block;
    text-align: right;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    &.delete {
        color: #e0245e;
    }

    &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
`;

// 수정 모드 관련 스타일
const EditContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
`;

const TextArea = styled.textarea`
    border: 2px solid rgba(255, 255, 255, 0.5);
    padding: 20px;
    border-radius: 15px;
    font-size: 16px;
    color: white;
    background-color: black;
    width: 100%;
    resize: none;
    min-height: 100px;
    font-family: system-ui, -apple-system, sans-serif;

    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const FileInput = styled.input`
    display: none;
`;

const FileButton = styled.label`
    width: 100%;
    display: inline-block;
    padding: 10px;
    color: #1d9bf0;
    text-align: center;
    border-radius: 15px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        background-color: rgba(29, 155, 240, 0.1);
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 10px;
`;

const ActionButton = styled.button`
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SaveButton = styled(ActionButton)`
    background-color: #1d9bf0;
    color: white;
    &:hover:not(:disabled) {
        background-color: #1a8cd8;
    }
`;

const CancelButton = styled(ActionButton)`
    background-color: transparent;
    color: #1d9bf0;
    border: 1px solid #1d9bf0;
    &:hover {
        background-color: rgba(29, 155, 240, 0.1);
    }
`;

export default function Tweet({ username, photo, tweet, id, userId, createdAt }: ITweet) {
    const user = auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [editedTweet, setEditedTweet] = useState(tweet);
    const [editedFile, setEditedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            setIsMenuOpen(false);
        };

        if (isMenuOpen) {
            document.addEventListener('click', closeMenu);
        }

        return () => {
            document.removeEventListener('click', closeMenu);
        };
    }, [isMenuOpen]);

    // 파일 변경 핸들러
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files && files.length === 1) {
            setEditedFile(files[0]);
        }
    };

    // 트윗 수정 핸들러
    const onEdit = async () => {
        if (!user || isLoading || editedTweet === "") return;

        try {
            setIsLoading(true);
            const tweetRef = doc(db, "tweets", id);
            
            let updatedTweet = {
                tweet: editedTweet,
            };

            if (editedFile) {
                const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
                const result = await uploadBytes(locationRef, editedFile);
                const url = await getDownloadURL(result.ref);
                updatedTweet = {
                    ...updatedTweet,
                    photo: url
                };
            }

            await updateDoc(tweetRef, updatedTweet);
            setIsEditing(false);
            setEditedFile(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // 트윗 삭제 핸들러
    const onDelete = async () => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if (!ok || user?.uid !== userId) return;

        try {
            await deleteDoc(doc(db, "tweets", id));
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        return `${year}년 ${month} ${day}일`;
    };

    return (
        <Wrapper>
            <Header>
                <UserInfo>
                    <Username>{username}</Username>
                    <UserId>@{userId}</UserId>
                    <Dot>·</Dot>
                    <CreatedAt>{formatDate(createdAt)}</CreatedAt>
                </UserInfo>
                {user?.uid === userId && !isEditing && (
                    <MenuContainer>
                        <MenuButton onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}>
                            <FaEllipsisV />
                        </MenuButton>
                        <DropdownMenu isOpen={isMenuOpen}>
                            <MenuItem onClick={() => {
                                setIsEditing(true);
                                setIsMenuOpen(false);
                            }}>
                                Edit
                            </MenuItem>
                            <MenuItem 
                                className="delete" 
                                onClick={() => {
                                    onDelete();
                                    setIsMenuOpen(false);
                                }}
                            >
                                Delete
                            </MenuItem>
                        </DropdownMenu>
                    </MenuContainer>
                )}
            </Header>
            {isEditing ? (
                <EditContainer>
                    <TextArea
                        value={editedTweet}
                        onChange={(e) => setEditedTweet(e.target.value)}
                        placeholder="Edit your tweet..."
                        maxLength={180}
                    />
                    <FileInput
                        type="file"
                        id="file"
                        accept="image/*"
                        onChange={onFileChange}
                    />
                    <FileButton htmlFor="file">
                        {editedFile ? "Photo added ✅" : "Add photo"}
                    </FileButton>
                    <ButtonsContainer>
                        <CancelButton onClick={() => {
                            setIsEditing(false);
                            setEditedTweet(tweet);
                            setEditedFile(null);
                        }}>
                            Cancel
                        </CancelButton>
                        <SaveButton onClick={onEdit} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </SaveButton>
                    </ButtonsContainer>
                </EditContainer>
            ) : (
                <>
                    <Payload>{tweet}</Payload>
                    {photo && <Photo src={photo} />}
                </>
            )}
        </Wrapper>
    );
}