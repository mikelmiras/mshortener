import {MdOutlineAccountBox} from "react-icons/md"
export default function Header({user}){
    let btn = <button>Start</button>
    let options = <><a>Login</a>
    <a>Sign up</a></>
    if (user){
        options = <></>
        btn = <button className="acc-btn"><MdOutlineAccountBox/>{user.username}</button>
    }
    return(
        <header>
            <img src="/logo.png" />
            <nav className="pc-nav">
                {options}
                {btn}
                </nav>
                <nav className="mobile-nav">
                {btn}
                </nav>
        </header>
    )
}