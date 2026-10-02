#pragma once
#include"talent.h"
#include<string>
#include<cstring>
#include<vector>
#include<map>
#include<queue>
#include<iostream>

struct Event {
	std::string title;
	std::string content;
};

extern std::map<std::string, int>happen_id;
extern std::vector<Event>happen;
extern void load_event();
extern std::queue<std::string>happen_task;
std::string take_place(const std::string& xx);
