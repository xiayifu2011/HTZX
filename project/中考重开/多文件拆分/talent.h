#pragma once

#include<string>
#include<cstring>
#include<vector>
#include<map>
#include<queue>

struct Talented {
	static constexpr int N =1e3+5;
	static bool own[N];
	static bool cannot_be_own[N];
	std::vector<std::string>name;
	std::map<std::string, int>color;
	std::map<std::string, int>id;
	std::map<int, std::string>get_name;
	std::map<std::string, std::vector<std::string>>inconsistent;
	std::priority_queue<std::pair<int, std::string>, std::vector<std::pair<int, std::string>>> posses;//第一个数存储该天赋的等(颜色),按第一关键字排序,保证当天赋相互矛盾的时候等级高的天赋最先保留并排除其矛盾项
	void load() ;
	bool have(const std::string& question);
	void solve_conflict();
	void del(const std::string& Tal);
	std::string unlock(const std::string& Tal);
};

extern Talented talent;