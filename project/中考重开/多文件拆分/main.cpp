#include "UI.h"
#include "event.h"
#include "property.h"
#include "talent.h"
#include <algorithm>
#include <cmath>
#include <cstring>
#include <map>
#include <queue>
#include <string>
#include <utility>
#include <vector>

int weeks = 0;
int main() {
    while (1) {
        std::cout << "中文测试成功\nCan you read the Chinese clearly?\nIf so,please input 0\nif no,please input 1\n";
        bool UTF_8Chinese;
        std::cin >> UTF_8Chinese;
        if (UTF_8Chinese) {
            system("chcp 65001");
            // system("cls");
        } else {
            break;
        }
    }

    //prepare the game;
    load_event();
    talent.load();
    property["心态"] = 100 + rand() % 10 - 5;
    property["经济"] = 100 + rand() % 10 - 5;
    property["健康"] = 100 + rand() % 10 - 5;
    property["效率"] = 100 + rand() % 10 - 5;
    property["悟性"] = rand() % 10;
    property["社交"] = 100 + rand() % 10 - 5;
    property["压力"] = 10;

    weeks = 0;
    while (weeks <= 20) {
        system("cls");
        output(weeks);
        if (weeks == 0) {
            take_place("开学了");
            system("pause");
            weeks++;
            continue;
        }
        calcuate_property();
        weeks++;
        system("pause");
    }

    return 0;
}