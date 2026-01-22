import {Link, useNavigate} from "react-router-dom"
import "../App.css";

export default function landing() {
  const navigator = useNavigate();
  return (
    <div className='landingPageContainer'>

      <nav>
        <div className='navHeader'>
          <h2>ConnectUs</h2>
        </div>
        <div className='navlist'>
          <p onClick={()=>{
            navigator(`${Math.random()}`)
          }}>Join as guest</p>
          <p onClick={()=>{
            navigator("/auth")
          }}>Register</p>
          <div role='button'>
            <p onClick={()=>{
            navigator("/auth")
          }}>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1><span style={{color:'#FF9839'}}>Connect</span> with your loved ones</h1>
          <p>Cover a distance by ConnectUs</p>
          <div role="button">
            <Link to={"/home"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="mobile img"/>
        </div>
      </div>

    </div>
  )
}
