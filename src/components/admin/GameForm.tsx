import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Game } from "../../types/game";
import { GameForm as GameFormType } from "../../services/adminApi";
import { formatDateTimeInput } from "../../utils/gameUtils";

interface GameFormProps {
  isOpen: boolean;
  editingGame: Game | null;
  saving: boolean;
  onSave: (
    gameData: GameFormType
  ) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  defaultFormData: GameFormType;
}

const GameForm: React.FC<GameFormProps> = ({
  isOpen,
  editingGame,
  saving,
  onSave,
  onClose,
  defaultFormData,
}) => {
  const [formData, setFormData] = useState<GameFormType>(defaultFormData);

  useEffect(() => {
    if (editingGame) {
      setFormData({
        id: editingGame.id,
        songName: editingGame.songName,
        singerName: editingGame.singerName,
        startTime: new Date(editingGame.startTime),
        endTime: new Date(editingGame.endTime),
        textHint: editingGame.textHint || "",
        imageUrl: editingGame.imageUrl || "",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [editingGame, defaultFormData]);

  const handleSave = async () => {
    if (!formData.songName.trim() || !formData.singerName.trim()) {
      alert("لطفاً تمام فیلدهای اجباری را پر کنید");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      alert("زمان پایان باید بعد از زمان شروع باشد");
      return;
    }

    const result = await onSave(formData);
    if (result.success) {
      onClose();
    } else {
      alert(`خطا: ${result.error || "عملیات ناموفق بود"}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingGame ? "ویرایش بازی" : "ایجاد بازی جدید"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام آهنگ *
                </label>
                <input
                  type="text"
                  value={formData.songName}
                  onChange={(e) =>
                    setFormData({ ...formData, songName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام آهنگ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خواننده *
                </label>
                <input
                  type="text"
                  value={formData.singerName}
                  onChange={(e) =>
                    setFormData({ ...formData, singerName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام خواننده"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  زمان شروع *
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeInput(formData.startTime)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startTime: new Date(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  زمان پایان *
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeInput(formData.endTime)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endTime: new Date(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                راهنمایی متنی
              </label>
              <textarea
                value={formData.textHint}
                onChange={(e) =>
                  setFormData({ ...formData, textHint: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="راهنمایی متنی (اختیاری)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                لینک تصویر
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              لغو
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  ذخیره
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameForm;
