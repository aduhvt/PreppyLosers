import { CSSProperties } from "react";
import Navbar from "../components/Navbar";
import hero from "../assets/hero.jpg";

const Home = () => {
  return (
    <div style={styles.container}>
      <div style={styles.topSpace}></div>

      <div style={styles.navWrapper}>
        <Navbar />
      </div>

      <div style={styles.overlay}>
        <h2 style={styles.heading}>Elevate Your Style</h2>
        <p>Premium streetwear for the bold.</p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },

  topSpace: {
    height: "40px", // 👈 This makes image visible above navbar
  },

  navWrapper: {
    backgroundColor: "black",
    padding: "15px 60px",
  },

  overlay: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    textAlign: "center",
  },

  heading: {
    fontSize: "90px",
    fontWeight: 600,
    letterSpacing: "4px",
  },
};

export default Home;
