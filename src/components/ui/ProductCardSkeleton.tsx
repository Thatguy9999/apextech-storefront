export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-52 w-full bg-slate-200" />

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand */}
        <div className="h-3 w-16 bg-slate-200 rounded-full" />

        {/* Product name */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-slate-200 rounded-md" />
          <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
        </div>

        {/* Series badge */}
        <div className="h-5 w-20 bg-slate-200 rounded-full" />

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
          <div className="h-4 w-16 bg-slate-100 rounded-md" />
        </div>

        {/* Stock badge */}
        <div className="h-5 w-20 bg-slate-200 rounded-full" />

        {/* Add to cart button */}
        <div className="h-9 w-full bg-slate-200 rounded-lg mt-2" />

        {/* Compare button */}
        <div className="h-7 w-full bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
