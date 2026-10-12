require 'set'

n, m = gets.strip.split.map(&:to_i)
ps = gets.strip.split.map(&:to_i)
xy = readlines.map {|line| line.strip.split.map(&:to_i) }

sets = Array.new(n+1, nil)
(1..n).each do |i|
  sets[i] = Set.new( [i] )
end

xy.each do |x,y|
  unified = sets[x].union( sets[y] )
  unified.each do |i|
    sets[i] = unified
  end
end

result = Array.new(n+1, nil)

(1..n).each do |i|
  next if result[i]
  result[i] = sets[i].include?(ps[i-1]) ? 1 : 0
end

result[0]=0

#p sets
#p result
p result.inject(:+)
