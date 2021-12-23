bearingd=150;
bearingd1=214;
bearingD=240;
bearingH=40;
bearingH1=26;
bearingC=12;
bearingJ=165;
bearingJ1=225;
bearingN2=7;

use <threads.scad>

module primaryDisk() {
goniometerHeight=40+14;
goniometerRadius=bearingd1/2;
goniometerThickness=50;
color([224/255, 223/255, 219/255]) difference() {difference() {difference() {
cylinder(h=goniometerHeight, r1=goniometerRadius+goniometerThickness, r2=goniometerRadius+goniometerThickness, $fa=1, center=false);
translate(v = [0,0,-1]) cylinder(h=goniometerHeight+20, r1=goniometerRadius, r2=goniometerRadius, $fa=1, center=false);
}


translate(v = [0,0,-1])cylinder(h=bearingH1+1, r1=bearingD/2, r2=bearingD/2, $fa=1, center=false);
}

//translate(v = [0,0,bearingH1-1])make_ring_of(radius = bearingJ1/2, count = 1)metric_thread (bearingN2, 1.5, bearingH-bearingH1+2, internal=true);
translate(v = [0,0,bearingH1-1])make_ring_of(radius = bearingJ1/2, count = 33)cylinder(h=bearingH-bearingH1+20, r1=bearingN2/2, r2=bearingN2/2, $fa=1, center=false);
}

}

module make_ring_of(radius, count)
{
    for (a = [0 : count - 1]) {
        angle = a * 360 / count;
        translate(radius * [sin(angle), -cos(angle), 0])
            rotate([0, 0, angle])
                children();
    }
}

primaryDisk();
//import("P-541.ZCD.STEP");
