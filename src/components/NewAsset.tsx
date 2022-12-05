import { useState } from "react";

type NewAssetProps = {
  addNewAsset: (newAsset: string) => void;
};

const NewAsset = ({ addNewAsset }: NewAssetProps) => {
  const [newAsset, setNewAsset] = useState<string>("");

  return (
    <input
      type="text"
      value={newAsset}
      onChange={(e) => setNewAsset(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          addNewAsset(newAsset);
          setNewAsset("");
        }
      }}
    />
  );
};

export default NewAsset;
