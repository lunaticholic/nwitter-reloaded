import { Navigate } from "react-router-dom";
import { auth } from "../firebase"

export default function ProtectedRoute({children}: {children: React.ReactNode}) {
    // 현재 로그인되어 있는 user를 확인하는 코드
    const user = auth.currentUser;
    
    // 로그인되어 있지 않으면 로그인 페이지로 redirect 시키기
    if (user === null) {
        return <Navigate to="/login" />
    }

    return children
}