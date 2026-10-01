#include<bits/stdc++.h>
#include<windows.h>
using namespace std;

const int N = 1e3+5;

int weeks = 0;


struct Talented {

	bool own[N];
	bool cannot_be_own[N];

	vector<string>name;
	map<string, int>color;
	map<string, int>id;
	map<int, string>get_name;
	map<string, vector<string>>inconsistent;

	priority_queue<pair<int, string>, vector<pair<int, string>>> posses;//第一个数存储该天赋的等(颜色),按第一关键字排序,保证当天赋相互矛盾的时候等级高的天赋最先保留并排除其矛盾项
	void load() {
		string Tal;

		Tal = "道心如铁"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 5; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"豪","玻璃心", "内耗者", "多动症"}; //矛盾项


		Tal = "天行健"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 6; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"玻璃心", "内耗者", "多动症", "体弱多病", "学习特困生", "迟钝"}; //矛盾项

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
		inconsistent[Tal] = {"道心如铁","不吃压力"};



		Tal = "内耗者"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 2; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"天行健", "道心如铁"}; //矛盾项


		Tal = "大胃袋"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 3; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {}; //矛盾项


		Tal = "体弱多病"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 3; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"天行健", "钢筋铁骨"}; //矛盾项

		Tal = "家财万贯"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 5; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"家徒四壁"}; //矛盾项

		Tal = "家徒四壁"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 3; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"家财万贯"}; //矛盾项

		Tal = "热情"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 2; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"高冷"}; //矛盾项

		Tal = "豪"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 2; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"高冷", "道心如铁"}; //矛盾项

		Tal = "七窍玲珑"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 5; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"学习特困生", "迟钝"}; //矛盾项

		Tal = "学习特困生"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 3; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"七窍玲珑", "天行健"}; //矛盾项

		Tal = "迟钝"; //名称
		name.push_back(Tal);
		id[Tal] = name.size(); //名字-->编号
		color[Tal] = 3; //颜色等级
		get_name[name.size()] = Tal; //编号-->名字
		inconsistent[Tal] = {"七窍玲珑", "天行健"}; //矛盾项

	}

	bool have(string question) { //是否拥有某天赋
		if (id.find(question) == id.end()) {
			return false;
		} else {
			return own[id[question]];
		}
	}

	void solve_conflict() { //刷新天赋并处理矛盾项
		queue<string>tmp_;
		memset(cannot_be_own, 0, sizeof(cannot_be_own));
		memset(own, 0, sizeof(own));
		while (!posses.empty()) {
			string now_ = posses.top().second;
			if (cannot_be_own[id[now_]]==0) { // 无等级更高的矛盾项
				own[id[now_]] = 1; //标记为拥有
				tmp_.push(now_);
				//将其矛盾项标记为不可拥有
				for (auto i : inconsistent[now_]) {
					cannot_be_own[id[now_]] = 1;
				}
			}
			posses.pop();
		}
		while (!tmp_.empty()) {
			posses.push({color[tmp_.front()], tmp_.front()});
			tmp_.pop();
		}
	}

	void del(string Tal) { //删除某天赋
		queue<pair<int, string>>tmp_;
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

	string unlock(string Tal) { //解锁某天赋 返回值  1:成功 0:失败
		for(string i:inconsistent[Tal]){
			if(have(i)&&color[i]>=color[Tal]){
				return i;
			}
			if(have(i)&&color[i]<color[Tal]){
				del(i);
			}
		}
		posses.push({color[Tal],Tal});
		solve_conflict();
		return "success";
	}
} talent;


map<string, int>property;

void calcuate_property() {

	talent.solve_conflict();


	if (talent.have("道心如铁")) {
		property["心态"] = 130;
	} else {
		property["心态"] += rand() % 20 - 10 - 10 * (talent.have("内耗者"));
	}
	property["心态"] = min(150, property["心态"]);



	if (talent.have("家财万贯")) {
		property["经济"] += 150;
	} else {
		property["经济"] += (rand() % 40 - 20) -10 * (talent.have("家徒四壁")) - 10 * (talent.have("大胃袋"));
	}
	property["经济"] = max(0, property["经济"]);



	if (talent.have("钢筋铁骨") || talent.have("天行健")) {
		property["健康"] = 130;
	} else {
		property["健康"] += rand() % 20 - 10 - (rand() % 5) * (talent.have("体弱多病")) + 10 * (talent.have("大胃袋"));
	}
	property["健康"] = min(150, property["健康"]);



	if (talent.have("天行健")) {
		property["效率"] = 130;
	} else {
		property["效率"] += rand() % 20 - 10 + (property["健康"] - 100) -20 * (talent.have("多动症"));
	}
	property["效率"] = min(150, property["健康"]);


	if (talent.have("社交牛逼症")) {
		property["社交"] = 130;
	} else {
		property["社交"] += rand() % 20 - 10 - 5 * (talent.have("高冷")) + 10 * (talent.have("热情")) - (rand() % 10 - 5) * (talent.have("豪"));
	}
	property["社交"] = min(150, property["社交"]);
	property["社交"] = max(10, property["社交"]);

	property["悟性"] += 1 + rand() % 5 * (!talent.have("迟钝")) + 5 * (talent.have("七窍玲珑"));
	property["悟性"] = min(150, property["悟性"]);
	property["悟性"] = max(10, property["悟性"]);

	if (talent.have("不吃压力")) {
		property["压力"] = 50+(rand()%20-10);
	} else {
		property["压力"] += (rand() % 20 - 10) +20 * (talent.have("玻璃心"));
	}

}


struct Event {
	string title;
	string content;
};
map<string, int>happen_id;
vector<Event>happen;

void load_event() {
	Event H;

	H.title = "解锁天赋--天行健";
	H.content = "天行健,君子以自强不息\n天行健,6级天赋:身体,学习全面加强";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

	H.title = "解锁天赋--道心如铁";
	H.content = "炼心如炼铁，百炼转精坚\n道心如铁,5级天赋:心态稳定，效率高";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

	H.title = "解锁天赋--高冷";
	H.content = "又高又冷的大冰箱~~\n高冷,2级天赋:社交能力下降,社交类事件发生概率下降";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

	H.title = "解锁天赋--豪";
	H.content = "请允许我自豪,抱歉,豪到你了吗?\n豪,2级天赋:社交类事件发生概率上升";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

	H.title = "解锁天赋--社交牛逼症";
	H.content = "嘿bro\n社交牛逼症,4级天赋:社交能力上升,社交类事件发生概率上升";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

	H.title = "开学了";
	H.content = "新的学期，新的开始";
	happen.push_back(H);
	happen_id[H.title] = happen.size() - 1;

}

queue<string>happen_task;

string take_place(string xx) {
	//cout<<xx<<"  66 \n";
	if(xx=="wrong"){
		cout<<"something is wrong\n";
		return "end";
	}
	
	Event H =happen[happen_id[xx]];
	// cout<<"H.title "<<H.title<<"\n";
	// cout<<"H.title.length() "<<H.title.length()<<"\n";
	// cout<<"H.title.size() "<<H.title.size()<<"\n";
	// cout<<H.title.substr(0,14)<<"\n";

	if(H.title.size()>=14&&H.title.substr(0,14)=="解锁天赋--"){//&&
		
		int talent_name_length=H.title.length()-13
		;
		string tmp_talent=H.title.substr(14,talent_name_length);
	//	cout<<"jisuotianfu "<<tmp_talent<<"\n";
		if(talent.have(tmp_talent)){
			return "end";
		}
		if(talent.unlock(tmp_talent)=="success"){
			cout<<H.title<<"\n";
			cout<<H.content<<"\n";
			return "end";
		}else{
			cout<<H.title<<" "<<"失败\n";
			return "end";
		}
	}
	
	cout<<H.title<<"\n"<<H.content<<"\n";
	int player_chose;
	if(H.title=="开学了"){
		cout<<"豪\n道心如铁\n天行建\n高冷\n";
		cin>>player_chose;
		if(player_chose==1){
			take_place("解锁天赋--豪");
		}else if(player_chose==2){
			take_place("解锁天赋--道心如铁");
		}else if(player_chose==3){
			take_place("解锁天赋--天行健");
		}else if(player_chose==4){
			take_place("解锁天赋--高冷");
		}
		return "end";
	}
	return "wrong";
}

void output(){
	cout<<"第"<<weeks<<"周\n";
	cout<<"==========\n";
	cout<<"心态"<<" "<<	property["心态"]<<"\n";
	cout<<"经济"<<" "<<	property["经济"]<<"\n";
	cout<<"健康"<<" "<<	property["健康"]<<"\n";
	cout<<"效率"<<" "<<	property["效率"]<<"\n";
	cout<<"悟性"<<" "<<	property["悟性"]<<"\n";
	cout<<"社交"<<" "<<	property["社交"]<<"\n";
	cout<<"压力"<<" "<<	property["压力"]<<"\n";
	cout<<"==========\n";
	if(talent.posses.size()>0){cout<<"天赋\n";};
	talent.solve_conflict();
	vector<pair<int,string>>all_talent;
	while(!talent.posses.empty()){
		all_talent.push_back(talent.posses.top());
		talent.posses.pop();
	}
	for(auto i:all_talent){
		talent.posses.push(i);
		cout<<i.second<<" level "<<talent.color[i.second]<<"\n";
	}
	cout<<"========\n";
}

int main() {

	while(!talent.posses.empty()){
		talent.posses.pop();
	}
	talent.solve_conflict();

	system("chcp 65001");
	system("pause");

	srand(time(NULL));
	load_event();
	talent.load();

	property["心态"] = 100 + rand() % 10 - 5;
	property["经济"] = 100 + rand() % 10 - 5;
	property["健康"] = 100 + rand() % 10 - 5;
	property["效率"] = 100 + rand() % 10 - 5;
	property["悟性"] = rand()%10;
	property["社交"] = 100 + rand() % 10 - 5;
	property["压力"] = 10;

	while (1) {
		output();
		string next = "开学了";
		while(next!="end"){
			next=take_place(next);
		}
		system("pause");
		system("cls");
		calcuate_property();
	}


	return 0;
}
