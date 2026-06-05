import { useEffect, useState } from "react";
import { api } from "../api/client";

const ApiValuesStatus = () => {
  const [valuesData, setValuesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchValues = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const response = await api.getValues();
        setValuesData(response);
      } catch (error) {
        setErrorMessage(error.message || "Failed to connect to API");
      } finally {
        setIsLoading(false);
      }
    };

    fetchValues();
  }, []);

  if (isLoading) {
    return <p>Checking backend connection...</p>;
  }

  if (errorMessage) {
    return <p style={{ color: "#b00020" }}>Error: {errorMessage}</p>;
  }

  return (
    <div>
      <p><strong>Backend status:</strong> {valuesData?.message || "Connected"}</p>
      {valuesData?.timestamp ? (
        <p><strong>Server time (UTC):</strong> {new Date(valuesData.timestamp).toLocaleString()}</p>
      ) : null}
    </div>
  );
};

export default ApiValuesStatus;
