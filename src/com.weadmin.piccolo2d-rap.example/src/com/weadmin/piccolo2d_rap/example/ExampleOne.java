package com.weadmin.piccolo2d_rap.example;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.eclipse.rap.rwt.application.AbstractEntryPoint;
import org.eclipse.swt.SWT;
import org.eclipse.swt.layout.FillLayout;
import org.eclipse.swt.widgets.Composite;

import com.alibaba.fastjson.JSONObject;
import com.weadmin.piccolo2d_rap.Piccolo2dJS;

public class ExampleOne extends AbstractEntryPoint{

	private static final long serialVersionUID = 1L;

	@SuppressWarnings({ "unchecked", "deprecation" })
	@Override
	protected void createContents(Composite parent) {
		parent.setLayout(new FillLayout(SWT.VERTICAL));
//		parent.setLayout(null);
		Piccolo2dJS pjs = new Piccolo2dJS(parent, SWT.NONE);
//		pjs.setBounds(20, 0, 1000, 600);
		Date date = new Date("2016/11/29");
		pjs.showList(date,dataModle(date));
		JSONObject color = new JSONObject();
		color.put("package", "#8DB6CD");
		color.put("retime", "#8B8682");
		pjs.setLineColor(color);

	}

	/**
	 * Simulation within one month of data
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked", "static-access", "deprecation" })
	public static List dataModle(Date date){
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		int year = calendar.get(Calendar.YEAR);
		int month = calendar.get(Calendar.MONTH)+1;
		int randcount = 0;
		JSONObject json = null;
		ArrayList list = new ArrayList();
		int days = calendar.getActualMaximum(calendar.DATE);
		for(int i=1;i<days+1;i++){
			for(int j=0;j<24;j++){
				randcount = (int) (Math.random()*7);
				for(int k=0;k<randcount;k++){
					json = new JSONObject();
					json.put("savetime", year+"-"+(month<10?"0"+month:month)+"-"+(i<10?"0"+i:i) + " " +(j<10?"0"+j:j)+":"+getRandom(60)+":"+getRandom(60));
					json.put("package", getRandom(100));
					json.put("retime", new java.text.DecimalFormat("#.##").format((double)(Math.random())));
					list.add(json);
				}
			}
		}
		calendar.set(Calendar.DAY_OF_MONTH, 1);
		int prev = calendar.get(Calendar.DAY_OF_WEEK)-1;
		calendar.add(Calendar.MONTH, -1);
		int mon = calendar.getActualMaximum(calendar.DATE);
		for(int i=mon;i>mon-prev;i--){
			for(int j=0;j<24;j++){
				randcount = (int) (Math.random()*7);
				for(int k=0;k<randcount;k++){
					json = new JSONObject();
					json.put("savetime", year+"-"+(month-1<10?"0"+(month-1):month-1)+"-"+ (i<10?"0"+i:i) + " " +(j<10?"0"+j:j)+":"+getRandom(60)+":"+getRandom(60));
					json.put("package", getRandom(100));
					json.put("retime", new java.text.DecimalFormat("#.##").format((double)(Math.random())));
					list.add(json);
				}
			}
		}
		calendar.add(Calendar.MONTH, 1);
		if (calendar.get(Calendar.MONTH) <= new Date().getMonth()) {
			int next = 42-(prev+calendar.getActualMaximum(calendar.DATE));
			for(int i=1;i<next+1;i++){
				for(int j=0;j<24;j++){
					randcount = (int) (Math.random()*7);
					for(int k=0;k<randcount;k++){
						json = new JSONObject();
						json.put("savetime", year+"-"+(month+1<10?"0"+(month+1):month+1)+"-"+(i<10?"0"+i:i) + " " +(j<10?"0"+j:j)+":"+getRandom(60)+":"+getRandom(60));
						json.put("package", getRandom(100));
						json.put("retime", new java.text.DecimalFormat("#.##").format((double)(Math.random())));
						list.add(json);
					}
				}
			}
		}
		return list;
	}

	public static String getRandom(int t){
		int i = (int) (Math.random()*t);
		String s = (i<10?"0"+i:i+"");
		return s;
	}

}
