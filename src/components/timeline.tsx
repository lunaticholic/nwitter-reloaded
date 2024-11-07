import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createdAt: number;
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: scroll;

    /* Firefox용 스크롤바 숨기기 */
    scrollbar-width: none;
    
    /* Chrome, Safari, Opera용 스크롤바 숨기기 */
    &::-webkit-scrollbar {
        display: none;
    }
    
    /* IE, Edge용 스크롤바 숨기기 */
    -ms-overflow-style: none;
`;

export default function Timeline(){
    
    // 트윗 목록
    const [tweets, setTweets] = useState<ITweet[]>([]);

    // 컴포넌트가 마운트될 때 트윗 목록을 가져옴
    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        // 트윗 목록을 가져오는 함���
    const fetchTweets = async () => {
        const tweetsQuery = query(
            collection(db, "tweets"),
            orderBy("createdAt", "desc"),
        );
        // 트윗 목록 가져오기
        // const snapshot = await getDocs(tweetsQuery);
        // // 트윗 목록 표시
        // const tweets = snapshot.docs.map(doc => {
        //     // 트윗 목록 데이터 가져오기
        //     const { tweet, createdAt, userId, username, photo } = doc.data();
        //     // 트윗 목록 데이터 반환
        //     return {
        //         tweet, createdAt, userId, username, photo, id: doc.id,
        //     };
        // });

        unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
            // 트윗 목록 데이터 가져오기
            const tweets = snapshot.docs.map(doc => {
                // 트윗 목록 데이터 가져오기
                const { tweet, createdAt, userId, username, photo } = doc.data();
                // 트윗 목록 데이터 반환
                return { tweet, createdAt, userId, username, photo, id: doc.id };
            });
            // 트윗 목록 상태 업데이트
            setTweets(tweets);
        });
    };
        fetchTweets();
        return () => {
            unsubscribe && unsubscribe();
        };
    }, []);

    return (
        // 트윗 목록 표시
        <Wrapper>
            {tweets.map((tweet) => (
                <Tweet 
                    key={tweet.id} 
                    tweet={tweet.tweet} 
                    username={tweet.username} 
                    photo={tweet.photo}
                    userId={tweet.userId} 
                    createdAt={tweet.createdAt} 
                    id={tweet.id}
                />
            ))}
        </Wrapper>
    );
}