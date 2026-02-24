import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import hero from "../assets/hero.jpg";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  

  return (
    <div style={styles.container}>
      {/* Background Image Layer */}
      <div style={styles.background}></div>

      {/* Navbar floating above */}
      <div style={styles.navWrapper}>
        <Navbar />
      </div>

      {/* Hero Content */}
      <div style={styles.overlay}>
        <h1 style={styles.brandTitle}></h1>
        <p style={styles.tagline}>Underground street culture for the bold.</p>

        <button className="shop-button" onClick={() => navigate("/products")}>
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

const styles: any = {
  container: {
    position: "relative",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
  },

  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 0,
  },

  navWrapper: {
    position: "relative",
    zIndex: 2,
    paddingTop: "80px", // 👈 adds gap above navbar
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    zIndex: 1,
  },

  brandTitle: {
    fontSize: "clamp(40px, 6vw, 80px)",
    letterSpacing: "8px",
    marginBottom: "20px",
    
  },

  tagline: {
    fontSize: "18px",
    opacity: 0.85,
    marginBottom: "40px",
  },
};

export default Home;
