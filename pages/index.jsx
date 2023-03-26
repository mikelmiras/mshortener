

export default function Index(){
    return(
        <>
        <header>
            <img src="./logo.png" />
            <nav>
                <a>Login</a>
                <a>Sign up</a>
                <button>Start</button>
                </nav>
        </header>
        <MainSection>
            <div className="first">
            <h1>Make Your Links Manageable and Memorable: Simplify Your URLs with Our Powerful URL Shortener App!</h1>
            </div>
            <div className="btn-input-wrapper">
            <button className="generate-button">Generate</button>
            <input type={"text"} placeholder="Paste here your long link..."/>
            </div>
            </MainSection>
        </>
    )
}


export function MainSection({children}){
    return(
        <section className="main-section">
            {children}
        </section>
    )
}