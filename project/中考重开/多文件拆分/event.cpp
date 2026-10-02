#include"event.h"
#include"talent.h"


std::map<std::string, int>happen_id;
std::vector<Event>happen;

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

std::queue<std::string>happen_task;

std::string take_place(const std::string& xx){
	//std::cout<<xx<<"  66 \n";
	if(xx=="wrong"){
		std::cout<<"something is wrong\n";
		return "end";
	}
	
	Event H =happen[happen_id[xx]];
	// std::cout<<"H.title "<<H.title<<"\n";
	// std::cout<<"H.title.length() "<<H.title.length()<<"\n";
	// std::cout<<"H.title.size() "<<H.title.size()<<"\n";
	// std::cout<<H.title.substr(0,14)<<"\n";

	if(H.title.size()>=14&&H.title.substr(0,14)=="解锁天赋--"){//&&
		
		int talent_name_length=H.title.length()-13
		;
		std::string tmp_talent=H.title.substr(14,talent_name_length);
	//	std::cout<<"jisuotianfu "<<tmp_talent<<"\n";
		if(talent.have(tmp_talent)){
			return "end";
		}
		if(talent.unlock(tmp_talent)=="success"){
			std::cout<<H.title<<"\n";
			std::cout<<H.content<<"\n";
			return "end";
		}else{
			std::cout<<H.title<<" "<<"失败\n";
			return "end";
		}
	}
	
	std::cout<<H.title<<"\n"<<H.content<<"\n";
	int player_chose;
	if(H.title=="开学了"){
		std::cout<<"豪\n道心如铁\n天行建\n高冷\n";
		std::cin>>player_chose;
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
