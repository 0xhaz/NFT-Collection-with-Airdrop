"use client";
interface CustomButtonProps {
  btnType: "button" | "reset" | "submit" | undefined;
  title: string;
  styles: string;
  handleClick: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  btnType = "button",
  title,
  styles = "",
  handleClick,
  disabled = false,
}) => {
  return (
    <button
      type={btnType}
      className={`h-16 w-[500px]  bg-gradient-to-br  from-yellow-400 to-purple-600  hover:from-purple-600  hover:to-yellow-400  text-white rounded-full mt-10 font-bold transition-all duration-300 bg-pos-100 hover:bg-pos-0 ${styles}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {title}
    </button>
  );
};

export default CustomButton;
