---
layout: post
title: Welcome to Jekyll! # 제목
subtitle: A awesome static site generator. # 부제목
author: Jeffrey # 작성자
categories: jekyll # 카테고리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4 # 배너 동영상
  loop: true # 반복 재생
  volume: 0.8 # 볼륨
  start_at: 8.5 # 시작 시간
  image: https://bit.ly/3xTmdUP # 미리보기 이미지
  opacity: 0.618 # 투명도
  background: "#000" # 배경색
  height: "40vh" # 배너 높이
  min_height: "38vh" #최소 높이
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline" # 제목 스타일
  subheading_style: "color: gold" # 부제목 스타일
tags: jekyll theme yat # 태그: jekyll, theme, yat
top: 1 # 최상단 표시 여부
sidebar: [] # 사이드바
---
<!-- '' == 강조 -->
You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. You can rebuild the site in many different ways, but the most common way is to run `jekyll serve`, which launches a web server and auto-regenerates your site when a file is updated.

To add new posts, simply add a file in the `_posts` directory that follows the convention `YYYY-MM-DD-name-of-post.ext` and includes the necessary front matter. Take a look at the source for this post to get an idea about how it works.

<!-- ## == 제목 2 -->
## section 1 

Jekyll also offers powerful support for code snippets:

<!-- {% highlight ruby %}{% endhighlight %} == 루비 코드 박스 -->
{% highlight ruby %}
def print_hi(name)
puts "Hi, #{name}"
end
print_hi('Tom')
#=> prints 'Hi, Tom' to STDOUT.
{% endhighlight %}
<!-- 루비 코드 박스 end -->

## section 2

<!-- [] == 하이퍼링크 -->
Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]: https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/

$ a \* b = c ^ b $

$ 2^{\frac{n-1}{3}} $

$ \int_a^b f(x)\,dx. $

<!-- ```cpp,``` == cpp 코드 박스  -->
```cpp
#include <iostream>
using namespace std;

int main() {
  cout << "Hello World!";
  return 0;
}
// prints 'Hi, Tom' to STDOUT.
```

<!-- ```python,``` == python 코드 박스  -->
```python
class Person:
  def __init__(self, name, age):
    self.name = name
    self.age = age

p1 = Person("John", 36)

print(p1.name)
print(p1.age)
```
