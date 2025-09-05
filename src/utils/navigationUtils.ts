export const preserveQueryParams = (
  newPath: string,
  currentSearch?: string
): string => {
  if (typeof window === "undefined") {
    return newPath;
  }

  const searchParams = currentSearch || window.location.search;

  if (!searchParams) {
    return newPath;
  }

  const urlParams = new URLSearchParams(searchParams);

  const userParams = new URLSearchParams();

  const preserveKeys = [
    "user_id",
    "chat_id",
    "message_id",
    "query_id",
    "inline_message_id",
    "chat_instance",
    "first_name",
    "last_name",
    "username",
  ];

  preserveKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      userParams.set(key, value);
    }
  });

  const [basePath, existingQuery] = newPath.split("?");
  const finalParams = new URLSearchParams(existingQuery || "");

  userParams.forEach((value, key) => {
    if (!finalParams.has(key)) {
      finalParams.set(key, value);
    }
  });

  const queryString = finalParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
