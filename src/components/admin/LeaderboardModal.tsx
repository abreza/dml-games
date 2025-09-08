import React from "react";
import { X, Trophy, Users } from "lucide-react";
import { Game } from "../../types/game";
import { downloadLeaderboardCSV } from "../../utils/gameUtils";

interface PlayerLeaderboard {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  game: Game | null;
  leaderboardData: PlayerLeaderboard[];
  loading: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  game,
  leaderboardData,
  loading,
  onClose,
}) => {
  if (!isOpen || !game) return null;

  const completedPlayers = leaderboardData.filter((p) => p.isCompleted).length;
  const maxScore =
    leaderboardData.length > 0
      ? Math.max(...leaderboardData.map((p) => p.score))
      : 0;
  const avgScore =
    leaderboardData.length > 0
      ? Math.round(
          leaderboardData.reduce((sum, p) => sum + p.score, 0) /
            leaderboardData.length
        )
      : 0;

  const handleDownloadCSV = () => {
    downloadLeaderboardCSV(leaderboardData, game.songName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                رتبه‌بندی بازی
              </h2>
              <p className="text-gray-600 mt-1">
                {game.songName} - {game.singerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {leaderboardData.length}
                  </div>
                  <div className="text-sm text-blue-800">کل شرکت‌کنندگان</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedPlayers}
                  </div>
                  <div className="text-sm text-green-800">تکمیل کننده</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {maxScore}
                  </div>
                  <div className="text-sm text-orange-800">بالاترین امتیاز</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {avgScore}
                  </div>
                  <div className="text-sm text-purple-800">میانگین امتیاز</div>
                </div>
              </div>

              {leaderboardData.length > 0 ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    رتبه‌بندی بازیکنان
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {leaderboardData.map((player, index) => (
                      <div
                        key={player.userId}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {player.userName}
                              </span>
                              {player.isCompleted ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ تکمیل شده
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  در حال بازی
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {player.userId}
                              {player.completedAt && (
                                <span className="mr-2">
                                  • تکمیل:{" "}
                                  {new Date(player.completedAt).toLocaleString(
                                    "fa-IR"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <span
                            className={`font-bold text-lg ${
                              player.isCompleted
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          >
                            {player.score.toLocaleString("fa-IR")}
                          </span>
                          <div className="text-xs text-gray-500">امتیاز</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    هیچ بازیکنی موجود نیست
                  </h3>
                  <p className="text-gray-500">
                    هنوز هیچکس در این بازی شرکت نکرده است
                  </p>
                </div>
              )}

              {leaderboardData.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      آخرین بروزرسانی: {new Date().toLocaleString("fa-IR")}
                    </div>
                    <button
                      onClick={handleDownloadCSV}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      دانلود CSV
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
