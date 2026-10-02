#include"property.h"
#include"talent.h"

std::map<std::string, int>property;

void calcuate_property() {

	talent.solve_conflict();


	if (talent.have("道心如铁")) {
		property["心态"] = 130;
	} else {
		property["心态"] += rand() % 20 - 10 - 10 * (talent.have("内耗者"));
	}
	property["心态"] = std::min(150, property["心态"]);



	if (talent.have("家财万贯")) {
		property["经济"] += 150;
	} else {
		property["经济"] += (rand() % 40 - 20) -10 * (talent.have("家徒四壁")) - 10 * (talent.have("大胃袋"));
	}
	property["经济"] = std::max(0, property["经济"]);



	if (talent.have("钢筋铁骨") || talent.have("天行健")) {
		property["健康"] = 130;
	} else {
		property["健康"] += rand() % 20 - 10 - (rand() % 5) * (talent.have("体弱多病")) + 10 * (talent.have("大胃袋"));
	}
	property["健康"] = std::min(150, property["健康"]);



	if (talent.have("天行健")) {
		property["效率"] = 130;
	} else {
		property["效率"] += rand() % 20 - 10 + (property["健康"] - 90) -20 * (talent.have("多动症"));
	}
	property["效率"] = std::min(150, property["效率"]);
	property["效率"] = std::max(0, property["效率"]);

	if (talent.have("社交牛逼症")) {
		property["社交"] = 130;
	} else {
		property["社交"] += rand() % 20 - 10 - 5 * (talent.have("高冷")) + 10 * (talent.have("热情")) - (rand() % 10 - 5) * (talent.have("豪"));
	}
	property["社交"] = std::min(150, property["社交"]);
	property["社交"] = std::max(10, property["社交"]);

	property["悟性"] += 1 + rand() % 5 * (!talent.have("迟钝")) + 5 * (talent.have("七窍玲珑"));
	property["悟性"] = std::min(150, property["悟性"]);
	property["悟性"] = std::max(10, property["悟性"]);

	if (talent.have("不吃压力")) {
		property["压力"] = std::min(property["压力"],50+(rand()%20-10));
	} else {
		property["压力"] += (rand() % 20 - 10) +20 * (talent.have("玻璃心"));
	}

}
