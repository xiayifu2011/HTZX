#include <bits/stdc++.h>
#include <iostream>
#include <random>
#include <string>
#include <windows.h>
using namespace std;
int c = 15;
bool a[20][20];

void typewriterEx(const string &text, int speed = 50, bool randomSpeed = false) {
	for (char c : text) {
		cout << c << flush;
		Sleep(randomSpeed ? rand() % 100 + 10 : speed);
	}
}


//初始界面
void start(int c) {
	system("cls");
	HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
	SetConsoleTextAttribute(hConsole, c);
	typewriterEx("1.开始游戏\n", 20);
	//typewriterEx("2.选择颜色\n", 20);
	typewriterEx("2.退出游戏\n", 20);
}

int main() {
	std::cout << "\033[2J\033[1;1H";

	while (1) {
		std::cout << "\033[2J\033[1;1H";
		start(c);
		int a;
		cin >> a;
	}

//	SetConsoleTextAttribute(hConsole, 11);
//	typewriterEx("★ 支持随机速度输出\n", 0, true);

	return 0;
}
