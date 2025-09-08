import React from "react";
import { Edit, Trash2, Users, Music } from "lucide-react";
import { Game } from "../../types/game";
import { getGameStatus, formatDateTime } from "../../utils/gameUtils";

interface GamesTableProps {
  games: Game[];
  onEdit: (game: Game) => void;
  onDelete: (gameId: string) => void;
  onViewLeaderboard: (game: Game) => void;
  onCreateNew: () => void;
}

const GamesTable: React.FC<GamesTableProps> = ({
  games,
  onEdit,
  onDelete,
  onViewLeaderboard,
  onCreateNew,
}) => {
  const handleDelete = async (gameId: string) => {
    if (!confirm("آیا از حذف این بازی مطمئن هستید؟")) {
      return;
    }
    onDelete(gameId);
  };

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            هیچ بازی‌ای موجود نیست
          </h3>
          <p className="text-gray-500 mb-6">اولین بازی خود را ایجاد کنید</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ایجاد بازی جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                آهنگ
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                خواننده
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                شروع
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                پایان
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game) => {
              const status = getGameStatus(game);
              return (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.songName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.singerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(game.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(game.endTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => onEdit(game)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="ویرایش بازی"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewLeaderboard(game)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="مشاهده رتبه‌بندی"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="حذف بازی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GamesTable;
