import { useState, useEffect } from "react";
import axiosInstanceClient from "../services/client.services";
import type { Customer } from "../Types/types";

interface LeadsResponse {
  data: {
    leads: Customer[];
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstanceClient
      .get<LeadsResponse>("/leads")
      .then((res) => {
        setCustomers(res.data.data.leads ?? []);
      })
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  return { customers, loading, error };
}