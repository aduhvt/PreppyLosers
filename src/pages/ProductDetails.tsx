import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const addToWishlist = () => {
    if (!product) return;

    const existingWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]",
    );

    const exists = existingWishlist.find(
      (item: any) => item._id === product._id,
    );

    if (!exists) {
      existingWishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(existingWishlist));

      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const res = await axios.get(`http://localhost:5000/api/products/${id}`);
    setProduct(res.data);
  };

  const addToCart = () => {
    if (!product) return;

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = existingCart.find(
      (item: any) => item._id === product._id,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    window.dispatchEvent(new Event("cartUpdated"));

    // 🔥 SHOW TOAST
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };
  if (!product) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div style={styles.container}>
      {product && (
        <div style={styles.wrapper}>
          {/* LEFT - Product Image */}
          <div style={styles.imageSection}>
            <img
              src={product.images[0]}
              alt={product.name}
              style={styles.mainImage}
            />
          </div>

          {/* RIGHT - Product Info */}
          <div style={styles.detailsSection}>
            <h1 style={styles.title}>{product.name}</h1>
            <p style={styles.price}>₹ {product.price}</p>

            <p style={styles.description}>{product.description}</p>

            {/* Size Selector */}
            <div style={styles.sizeSection}>
              <p>Select Size</p>
              <div style={styles.sizeGrid}>
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    style={{
                      ...styles.sizeButton,
                      background:
                        selectedSize === size ? "white" : "transparent",
                      color: selectedSize === size ? "black" : "white",
                    }}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonRow}>
              <div className="button-row">
                <button className="cart-btn" onClick={addToCart}>
                  Add to Cart
                </button>

                <button className="wishlist-btn" onClick={addToWishlist}>
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showToast && <div className="toast">{product?.name} added to cart</div>}
    </div>
  );
};

const styles: any = {
  container: {
    background: "#0e0e0e",
    color: "white",
    minHeight: "100vh",
    padding: "80px 60px",
  },

  wrapper: {
    display: "flex",
    gap: "80px",
    alignItems: "flex-start",
  },

  imageSection: {
    flex: 1,
  },

  mainImage: {
    width: "100%",
    borderRadius: "16px",
    objectFit: "cover",
  },

  detailsSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  title: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  price: {
    fontSize: "24px",
    marginBottom: "20px",
  },

  description: {
    opacity: 0.8,
    marginBottom: "30px",
  },

  sizeSection: {
    marginBottom: "30px",
  },

  sizeGrid: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },

  sizeButton: {
    padding: "10px 18px",
    border: "1px solid white",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  buttonRow: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
};

export default ProductDetails;
