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
    const fetchCustomers = async () => {
      try {
        const res = await axiosInstanceClient.get<LeadsResponse>("/leads");
        setCustomers(res.data.data.leads ?? []);
      } catch {
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, loading, error };
}