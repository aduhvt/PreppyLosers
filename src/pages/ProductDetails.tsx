import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const res = await axios.get(`http://localhost:5000/api/products/${id}`);
    setProduct(res.data);
  };

  const addToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    setIsAdding(true);

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItemIndex = existingCart.findIndex(
      (item: any) =>
        item._id === product._id && item.selectedSize === selectedSize,
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        ...product,
        selectedSize,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1200);
    }, 300);
  };

  if (!product) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <img
        src={product.images[0]}
        alt={product.name}
        style={{ width: "400px", borderRadius: "12px" }}
      />

      <h1>{product.name}</h1>
      <h2>₹ {product.price}</h2>
      <p>{product.description}</p>

      <h3>Available Sizes:</h3>
      <div>
        {product.sizes.map((size: string) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            style={{
              marginRight: "10px",
              background: selectedSize === size ? "white" : "#222",
              color: selectedSize === size ? "black" : "white",
            }}
          >
            {size}
          </button>
        ))}
      </div>

      <button
        onClick={addToCart}
        className={`add-btn ${isAdding ? "press" : ""} ${
          added ? "success" : ""
        }`}
      >
        {added ? "✔ Added" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductDetails;
