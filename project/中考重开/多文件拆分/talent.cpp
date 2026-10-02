#include "talent.h"

//	static const int N =1e3+5;
bool Talented::own[N];
bool Talented::cannot_be_own[N];

Talented talent;

void Talented::load() {
    std::string Tal;

    Tal = "道心如铁"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                                    // 名字-->编号
    color[Tal] = 5;                                           // 颜色等级
    get_name[name.size()] = Tal;                              // 编号-->名字
    inconsistent[Tal] = {"豪", "玻璃心", "内耗者", "多动症"}; // 矛盾项

    Tal = "天行健"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                                                                // 名字-->编号
    color[Tal] = 6;                                                                       // 颜色等级
    get_name[name.size()] = Tal;                                                          // 编号-->名字
    inconsistent[Tal] = {"玻璃心", "内耗者", "多动症", "体弱多病", "学习特困生", "迟钝"}; // 矛盾项

    Tal = "高冷";
    name.push_back(Tal);
    id[Tal] = name.size();
    color[Tal] = 2;
    get_name[name.size()] = Tal;
    inconsistent[Tal] = {"社交牛逼症", "热情", "豪"};

    Tal = "社交牛逼症";
    name.push_back(Tal);
    id[Tal] = name.size();
    color[Tal] = 4;
    get_name[name.size()] = Tal;
    inconsistent[Tal] = {"高冷"};

    Tal = "不吃压力";
    name.push_back(Tal);
    id[Tal] = name.size();
    color[Tal] = 3;
    get_name[name.size()] = Tal;
    inconsistent[Tal] = {"玻璃心"};

    Tal = "玻璃心";
    name.push_back(Tal);
    id[Tal] = name.size();
    color[Tal] = 2;
    get_name[name.size()] = Tal;
    inconsistent[Tal] = {"道心如铁", "不吃压力"};

    Tal = "内耗者"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                      // 名字-->编号
    color[Tal] = 2;                             // 颜色等级
    get_name[name.size()] = Tal;                // 编号-->名字
    inconsistent[Tal] = {"天行健", "道心如铁"}; // 矛盾项

    Tal = "大胃袋"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();       // 名字-->编号
    color[Tal] = 3;              // 颜色等级
    get_name[name.size()] = Tal; // 编号-->名字
    inconsistent[Tal] = {};      // 矛盾项

    Tal = "体弱多病"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                      // 名字-->编号
    color[Tal] = 3;                             // 颜色等级
    get_name[name.size()] = Tal;                // 编号-->名字
    inconsistent[Tal] = {"天行健", "钢筋铁骨"}; // 矛盾项

    Tal = "家财万贯"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();            // 名字-->编号
    color[Tal] = 5;                   // 颜色等级
    get_name[name.size()] = Tal;      // 编号-->名字
    inconsistent[Tal] = {"家徒四壁"}; // 矛盾项

    Tal = "家徒四壁"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();            // 名字-->编号
    color[Tal] = 3;                   // 颜色等级
    get_name[name.size()] = Tal;      // 编号-->名字
    inconsistent[Tal] = {"家财万贯"}; // 矛盾项

    Tal = "热情"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();        // 名字-->编号
    color[Tal] = 2;               // 颜色等级
    get_name[name.size()] = Tal;  // 编号-->名字
    inconsistent[Tal] = {"高冷"}; // 矛盾项

    Tal = "豪"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                    // 名字-->编号
    color[Tal] = 2;                           // 颜色等级
    get_name[name.size()] = Tal;              // 编号-->名字
    inconsistent[Tal] = {"高冷", "道心如铁"}; // 矛盾项

    Tal = "七窍玲珑"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                      // 名字-->编号
    color[Tal] = 5;                             // 颜色等级
    get_name[name.size()] = Tal;                // 编号-->名字
    inconsistent[Tal] = {"学习特困生", "迟钝"}; // 矛盾项

    Tal = "学习特困生"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                      // 名字-->编号
    color[Tal] = 3;                             // 颜色等级
    get_name[name.size()] = Tal;                // 编号-->名字
    inconsistent[Tal] = {"七窍玲珑", "天行健"}; // 矛盾项

    Tal = "迟钝"; // 名称
    name.push_back(Tal);
    id[Tal] = name.size();                      // 名字-->编号
    color[Tal] = 3;                             // 颜色等级
    get_name[name.size()] = Tal;                // 编号-->名字
    inconsistent[Tal] = {"七窍玲珑", "天行健"}; // 矛盾项
}

bool Talented::have(const std::string &question) { // 是否拥有某天赋
    if (id.find(question) == id.end()) {
        return false;
    } else {
        return Talented::own[id[question]];
    }
}

void Talented::solve_conflict() { // 刷新天赋并处理矛盾项
    std::queue<std::string> tmp_;
    memset(cannot_be_own, 0, sizeof(cannot_be_own));
    memset(own, 0, sizeof(own));
    while (!posses.empty()) {
        std::string now_ = posses.top().second;
        if (cannot_be_own[id[now_]] == 0) { // 无等级更高的矛盾项
            own[id[now_]] = 1;              // 标记为拥有
            tmp_.push(now_);
            // 将其矛盾项标记为不可拥有
            for (auto i : inconsistent[now_]) {
                cannot_be_own[id[i]] = 1;
            }
        }
        posses.pop();
    }
    while (!tmp_.empty()) {
        posses.push({color[tmp_.front()], tmp_.front()});
        tmp_.pop();
    }
}

void Talented::del(const std::string &Tal) { // 删除某天赋
    std::queue<std::pair<int, std::string>> tmp_;
    while (!posses.empty()) {
        if (posses.top().second != Tal) {
            tmp_.push(posses.top());
        }
        posses.pop();
    }
    while (!tmp_.empty()) {
        posses.push(tmp_.front());
        tmp_.pop();
    }
    solve_conflict();
}

std::string Talented::unlock(const std::string &Tal) { // 解锁某天赋 返回值  1:成功 0:失败
    for (std::string i : inconsistent[Tal]) {
        if (have(i) && color[i] >= color[Tal]) {
            return i;
        }
        if (have(i) && color[i] < color[Tal]) {
            del(i);
        }
    }
    posses.push({color[Tal], Tal});
    solve_conflict();
    return "success";
}
