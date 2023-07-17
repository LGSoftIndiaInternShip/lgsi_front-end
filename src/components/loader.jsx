import "../style/loader.css";

const Loader = (props) => {
  return (
    <div className="wrapper" {...props}>
      <div className="spinner"></div>
      <div style={{ color: "white" }}>{props.children}</div>
    </div>
  );
};

export default Loader;
