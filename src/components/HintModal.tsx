import React from "react";
import { X, FileText, Eye } from "lucide-react";

interface HintModalProps {
  isOpen: boolean;
  type: "text" | "image";
  content: string;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  type,
  content,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              {type === "text" ? (
                <FileText className="w-5 h-5 text-yellow-600" />
              ) : (
                <Eye className="w-5 h-5 text-orange-600" />
              )}
              <h3 className="text-lg font-bold text-telegram-text">
                {type === "text" ? "راهنمایی متنی" : "راهنمایی تصویری"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {type === "text" ? (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">
                  {content}
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <img
                  src={content}
                  alt="راهنمایی تصویری"
                  className="w-full rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Ys9ix2LEg24zYp9mB2Kog2YbYtNivPC90ZXh0Pjwvc3ZnPg==";
                  }}
                />
                <p className="text-orange-600 dark:text-orange-300 text-sm mt-2 text-center">
                  راهنمایی تصویری
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
