const SkeletonMessage = () => {
  return (
    <div
      className="
          flex
          flex-col
          gap-3
          p-4
          animate-pulse
        "
    >
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`
                rounded-2xl
                h-12
                bg-slate-700

                ${index % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto"}
              `}
        />
      ))}
    </div>
  );
};

export default SkeletonMessage;
