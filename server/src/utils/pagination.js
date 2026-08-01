export const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 12));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const paginatedResponse = (data, total, page, limit) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
