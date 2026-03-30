"use server";

import { serverApiClient } from "@/lib/api-client";

/**
 * Fetch all verified doctors and group by specialty to build the specialty grid.
 */
export async function fetchSpecialtiesAction() {
  try {
    const body = await serverApiClient(
      "/doctors/search?size=200&sort=name&direction=asc",
    );

    // FIX: Added .data.data to correctly access the Spring Boot payload
    const doctors = body?.data?.data?.content ?? [];

    const map = {};
    for (const d of doctors) {
      const sp = d.specialty?.trim();
      if (!sp) continue;
      map[sp] = (map[sp] ?? 0) + 1;
    }

    const data = Object.entries(map)
      .map(([name, doctorCount]) => ({ name, doctorCount }))
      .sort((a, b) => b.doctorCount - a.doctorCount);

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Search doctors. Backend searches across name / email / phone / specialty / clinic / city
 * using a single `q` param.
 */
export async function searchDoctorsAction({
  query,
  page = 0,
  size = 12,
  sort = "name",
  direction = "asc",
}) {
  try {
    const params = new URLSearchParams({ page, size, sort, direction });
    if (query?.trim()) params.set("q", query.trim());

    const endpoint = `/doctors/search?${params.toString()}`;
    const body = await serverApiClient(endpoint);

    // FIX: Added .data.data to correctly access the Spring Boot payload
    const pd = body?.data?.data ?? {};

    return {
      success: true,
      data: {
        content: pd.content ?? [],
        totalElements: pd.totalElements ?? 0,
        totalPages: pd.totalPages ?? 1,
        number: pd.number ?? 0,
      },
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
