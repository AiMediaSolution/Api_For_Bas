async function editStatus(data_Id, status, date) {
  const apiUrl = "https://your-api-url.com/updateStatus"; // Thay bằng URL API của bạn

  try {
    const response = await fetch(apiUrl, {
      method: "PUT", // Hoặc "PATCH" nếu API yêu cầu
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data_Id, status, date }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update status");
    }

    const result = await response.json();
    console.log("Status updated successfully:", result);
    alert("Status updated successfully");
  } catch (error) {
    console.error("Error updating status:", error);
    alert(error.message || "An error occurred");
  }
}
