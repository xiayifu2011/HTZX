#include "UI.h"
#include "property.h"
#include "talent.h"

void output(int how_many_weeks) {
    std::cout << "第" << how_many_weeks << "周\n";
    std::cout << "==========\n";
    std::cout << "心态" << " " << property["心态"] << "\n";
    std::cout << "经济" << " " << property["经济"] << "\n";
    std::cout << "健康" << " " << property["健康"] << "\n";
    std::cout << "效率" << " " << property["效率"] << "\n";
    std::cout << "悟性" << " " << property["悟性"] << "\n";
    std::cout << "社交" << " " << property["社交"] << "\n";
    std::cout << "压力" << " " << property["压力"] << "\n";
    std::cout << "==========\n";
    if (talent.posses.size() > 0) {
        std::cout << "天赋\n";
    };
    talent.solve_conflict();
    std::vector<std::pair<int, std::string>> all_talent;
    while (!talent.posses.empty()) {
        all_talent.push_back(talent.posses.top());
        talent.posses.pop();
    }
    for (auto i : all_talent) {
        talent.posses.push(i);
        std::cout << i.second << " level " << talent.color[i.second] << "\n";
    }
    std::cout << "========\n";
}
