import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Tweet from "./tweet";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createdAt: number;
}

const Wrapper = styled.div`
    
`;

export default function Timeline(){
    
    // 트윗 목록
    const [tweets, setTweets] = useState<ITweet[]>([]);

    // 트윗 목록을 가져오는 함수
    const fetchTweets = async () => {
        const tweetsQuery = query(
            collection(db, "tweets"),
            orderBy("createdAt", "desc"),
        );
        // 트윗 목록 가져오기
        const snapshot = await getDocs(tweetsQuery);
        // 트윗 목록 표시
        const tweets = snapshot.docs.map(doc => {
            const { tweet, createdAt, userId, username, photo } = doc.data();
            return {
                tweet, createdAt, userId, username, photo, id: doc.id,
            };
        });
        // 트윗 목록 상태 업데이트
        setTweets(tweets);
    };

    // 컴포넌트가 마운트될 때 트윗 목록을 가져옴
    useEffect(() => {
        fetchTweets();
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