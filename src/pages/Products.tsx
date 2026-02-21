import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // 👈 HERE

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Our Collection 🔥</h1>

      <div style={styles.grid}>
        {products.map((product) => (
          <Link
            to={`/products/${product._id}`}
            key={product._id}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={styles.card}>
              <img
                src={product.images[0]}
                alt={product.name}
                style={styles.image}
              />
              <h3>{product.name}</h3>
              <p>₹ {product.price}</p>
              <p style={{ fontSize: "14px", opacity: 0.7 }}>
                {product.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles: any = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    background: "#111",
    padding: "20px",
    borderRadius: "12px",
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "10px",
  },
};

export default Products;
